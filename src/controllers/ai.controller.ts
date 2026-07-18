import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIChatHistory, Program, RecommendationInteraction, User } from '../models/types';
import {
  getAICoachStream,
  generateFollowUpPrompts,
  rankAndExplainFit,
  RecommendationCandidate
} from '../services/groqService';

export async function chatWithCoach(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { message, conversationId } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const chatHistoryColl = getCollection<AIChatHistory>('aichathistories');
    let chatDoc: AIChatHistory | null = null;

    if (conversationId && ObjectId.isValid(conversationId)) {
      chatDoc = await chatHistoryColl.findOne({
        _id: new ObjectId(conversationId),
        userId: new ObjectId(req.user.id)
      });
    }

    if (!chatDoc) {
      const result = await chatHistoryColl.insertOne({
        userId: new ObjectId(req.user.id),
        messages: [],
        createdAt: new Date()
      });
      chatDoc = await chatHistoryColl.findOne({ _id: result.insertedId });
    }

    if (!chatDoc || !chatDoc._id) {
      return res.status(500).json({ error: 'Failed to retrieve or create conversation history.' });
    }

    // Get program context to feed into system prompt
    const programsColl = getCollection<Program>('programs');
    const allPrograms = await programsColl.find({}).project({ title: 1, difficulty: 1, category: 1 }).toArray();
    const contextPrograms = allPrograms.map(p => ({
      title: p.title,
      difficulty: p.difficulty,
      category: p.category
    }));

    // Setup headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Prepare temporary history array for Groq including current message
    const tempMessages = [
      ...chatDoc.messages,
      { role: 'user' as const, content: message, timestamp: new Date() }
    ];

    let fullResponseContent = '';
    const stream = await getAICoachStream(tempMessages, contextPrograms);

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullResponseContent += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Save user message and AI response back to MongoDB
    const updatedMessages = [
      ...chatDoc.messages,
      { role: 'user' as const, content: message, timestamp: new Date() },
      { role: 'assistant' as const, content: fullResponseContent, timestamp: new Date() }
    ];

    await chatHistoryColl.updateOne(
      { _id: chatDoc._id },
      { $set: { messages: updatedMessages } }
    );

    // Generate suggested follow-up prompts
    const followUps = await generateFollowUpPrompts(updatedMessages);

    // Write final chunk with status details
    res.write(`data: ${JSON.stringify({ done: true, conversationId: chatDoc._id.toString(), followUps })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error('AI Coach Chat Error:', error);
    // If headers have not been sent yet, send JSON error. Otherwise, write SSE error.
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Error processing AI chat.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming interrupted.' })}\n\n`);
      res.end();
    }
  }
}

export async function getRecommendations(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { goals, experienceLevel, equipment, filters } = req.body;

    const usersColl = getCollection<User>('user');
    const userDoc = await usersColl.findOne({ _id: new ObjectId(req.user.id) });

    const finalGoals = goals || userDoc?.goals || [];
    const finalExperience = experienceLevel || userDoc?.experienceLevel || 'beginner';
    const finalEquipment = equipment || userDoc?.equipment || [];

    const interactionColl = getCollection<RecommendationInteraction>('recommendationinteractions');
    const interactions = await interactionColl.find({ userId: new ObjectId(req.user.id) }).toArray();

    // Gather program IDs that user has saved or dismissed
    const dismissedIds = interactions
      .filter(i => i.interactionType === 'dismissed')
      .map(i => i.programId.toString());

    const savedIds = interactions
      .filter(i => i.interactionType === 'saved')
      .map(i => i.programId.toString());

    // Build MDB query filters
    const query: any = {};
    if (filters) {
      if (filters.difficulty && filters.difficulty !== 'all') {
        query.difficulty = filters.difficulty;
      }
      if (filters.category && filters.category !== 'all') {
        query.category = filters.category;
      }
      if (filters.durationWeeks) {
        query.durationWeeks = { $lte: Number(filters.durationWeeks) };
      }
    }

    // Filter out dismissed programs
    query._id = { $nin: dismissedIds.map(id => new ObjectId(id)) };

    const programsColl = getCollection<Program>('programs');
    const candidates = await programsColl.find(query).toArray();

    if (candidates.length === 0) {
      return res.json([]);
    }

    // Format programs as lightweight candidates for Groq API
    const formattedCandidates: RecommendationCandidate[] = candidates.map(c => ({
      id: c._id!.toString(),
      title: c.title,
      shortDescription: c.shortDescription,
      difficulty: c.difficulty,
      category: c.category,
      equipmentNeeded: c.equipmentNeeded
    }));

    // Call Groq ranking service
    const rankedList = await rankAndExplainFit(formattedCandidates, {
      goals: finalGoals,
      experienceLevel: finalExperience,
      equipment: finalEquipment
    });

    // Map rankings back to full programs & attach customizedfit explanations
    const resultPrograms = rankedList
      .map(rankItem => {
        const fullProg = candidates.find(c => c._id!.toString() === rankItem.id);
        if (!fullProg) return null;
        return {
          ...fullProg,
          whyFits: rankItem.reason,
          isSaved: savedIds.includes(rankItem.id)
        };
      })
      .filter(Boolean);

    // Log the "viewed" interaction for each recommended program
    const now = new Date();
    for (const prog of resultPrograms) {
      if (prog && prog._id) {
        await interactionColl.updateOne(
          {
            userId: new ObjectId(req.user.id),
            programId: prog._id,
            interactionType: 'viewed'
          },
          {
            $setOnInsert: {
              userId: new ObjectId(req.user.id),
              programId: prog._id,
              interactionType: 'viewed',
              timestamp: now
            }
          },
          { upsert: true }
        );
      }
    }

    res.json(resultPrograms);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error generating recommendations.' });
  }
}

export async function logRecommendationInteraction(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { programId, interactionType } = req.body;

    if (!programId || !ObjectId.isValid(programId)) {
      return res.status(400).json({ error: 'A valid Program ID is required.' });
    }

    const validTypes = ['saved', 'dismissed'];
    if (!interactionType || !validTypes.includes(interactionType)) {
      return res.status(400).json({ error: 'Interaction type must be either: saved or dismissed.' });
    }

    const interactionColl = getCollection<RecommendationInteraction>('recommendationinteractions');
    const programObjId = new ObjectId(programId);
    const userObjId = new ObjectId(req.user.id);

    // If saving, remove any dismissed log, and vice versa
    const typeToRemove = interactionType === 'saved' ? 'dismissed' : 'saved';
    await interactionColl.deleteMany({
      userId: userObjId,
      programId: programObjId,
      interactionType: typeToRemove
    });

    // Upsert the new interaction state
    await interactionColl.updateOne(
      {
        userId: userObjId,
        programId: programObjId,
        interactionType
      },
      {
        $set: { timestamp: new Date() }
      },
      { upsert: true }
    );

    res.json({ success: true, message: `Program interaction recorded as ${interactionType}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error logging interaction.' });
  }
}
