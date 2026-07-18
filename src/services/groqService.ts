import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

const MODEL_NAME = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Please configure it in your .env file.');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export async function getAICoachStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  contextPrograms: { title: string; difficulty: string; category: string }[]
) {
  const groq = getGroqClient();

  const programContextStr = contextPrograms.length > 0 
    ? `\nHere are some calisthenics programs available on the platform:\n${contextPrograms.map(p => `- ${p.title} (${p.difficulty}, ${p.category})`).join('\n')}`
    : '';

  const systemPrompt = `You are the Buildthenics AI Coach, an elite calisthenics, street workout, and nutrition specialist.
Your expertise is bodyweight training (strength, skills like handstands/planches/front-levers, mobility, joint care) and nutrition specific to calisthenics athletes.
Keep your answers motivating, actionable, and written in plain conversational text.
CRITICAL FORMATTING RULES - follow these exactly:
- Never use markdown formatting of any kind.
- Never use # or ## for headings. Write section titles as plain text followed by a colon, like "Warm Up:" or "Key Points:".
- Never use * or ** for bold or bullet points. Use plain numbered lists (1. 2. 3.) or plain dashes with a space (- item) for lists.
- Never use em dashes (—) or en dashes (–). Use a plain hyphen (-) or a comma instead.
- Never use backticks or code blocks.
- Write in short, clear paragraphs separated by blank lines.
${programContextStr}
Always prioritize recommending relevant programs from the list above when they fit the user's queries.
If the user asks questions completely unrelated to calisthenics or sports nutrition, politely steer them back to calisthenics.`;

  return groq.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ],
    stream: true,
  });
}

export async function generateFollowUpPrompts(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string[]> {
  try {
    const groq = getGroqClient();
    const recentMessages = messages.slice(-5);

    const systemPrompt = `Analyze the conversation between the user and the Buildthenics AI Coach.
Generate exactly 3 short, relevant, and engaging follow-up questions the user might want to click next.
Keep each prompt under 8 words. Make them direct and specific to the topics discussed.
Return a JSON object with a single key "prompts" containing an array of strings. Do not include markdown code block syntax.
Example: {"prompts": ["What exercises strengthen my wrists?", "Should I train handstands every day?", "What is a good pre-workout meal?"]}`;

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map(m => ({ role: m.role, content: m.content }))
      ],
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);
    if (parsed.prompts && Array.isArray(parsed.prompts)) {
      return parsed.prompts.slice(0, 3);
    }
    return [];
  } catch (error) {
    console.error('Error generating follow-up prompts:', error);
    return [
      'Tell me more about handstand progressions.',
      'What are some wrist strengthening exercises?',
      'How do I calculate my protein needs?'
    ];
  }
}

export interface RecommendationCandidate {
  id: string;
  title: string;
  shortDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'skills' | 'strength' | 'mobility' | 'street-workout';
  equipmentNeeded: string[];
}

export interface UserPreferences {
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
}

export async function rankAndExplainFit(
  candidates: RecommendationCandidate[],
  preferences: UserPreferences
): Promise<{ id: string; reason: string }[]> {
  try {
    const groq = getGroqClient();

    const systemPrompt = `You are a calisthenics program recommendation engine.
We will give you the user's goals, experience level, and available equipment.
We will also give you a list of candidate calisthenics programs.
Your task is to:
1. Rank the programs based on how well they fit the user's profile.
2. Generate a single, concise "why this fits you" sentence (max 15 words) for each program explaining the connection.
Format your output as a JSON object containing a "recommendations" array.
Each item in the array must have "id" (string) and "reason" (string) keys. Do not include markdown formatting.
Example: {"recommendations": [{"id": "123", "reason": "Uses your pull up bar to build upper-body strength and skills."}]}`;

    const userPrompt = `User Profile:
- Goals: ${preferences.goals.join(', ')}
- Experience Level: ${preferences.experienceLevel}
- Available Equipment: ${preferences.equipment.join(', ')}

Candidate Programs:
${JSON.stringify(candidates, null, 2)}`;

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);
    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations;
    }
    return [];
  } catch (error) {
    console.error('Error in Groq recommendation ranking:', error);
    // Return candidates in original order with a fallback explanation
    return candidates.map(c => ({
      id: c.id,
      reason: `Matches your ${c.difficulty} level and focuses on ${c.category} training.`
    }));
  }
}
