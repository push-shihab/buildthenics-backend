import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/db';
import { Program, Exercise } from '../models/types';
import { AuthRequest } from '../middleware/auth.middleware';

// Manual validation helper
function validateProgramData(body: any) {
  const errors: string[] = [];
  // Accept both 'description' (frontend/Atlas) and 'fullDescription' (legacy)
  const { title, shortDescription, description, fullDescription, coverImageUrl, difficulty, category, durationWeeks, equipmentNeeded, exercises } = body;
  const resolvedDescription = description || fullDescription;

  if (!title || typeof title !== 'string' || title.trim() === '') errors.push('Title must be a non-empty string.');
  if (!shortDescription || typeof shortDescription !== 'string' || shortDescription.trim() === '') errors.push('Short description must be a non-empty string.');
  if (!resolvedDescription || typeof resolvedDescription !== 'string' || resolvedDescription.trim() === '') errors.push('Full description must be a non-empty string.');
  if (!coverImageUrl || typeof coverImageUrl !== 'string' || coverImageUrl.trim() === '') errors.push('Cover image URL must be a non-empty string.');

  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  if (!difficulty || !validDifficulties.includes(difficulty)) {
    errors.push('Difficulty must be either: beginner, intermediate, or advanced.');
  }

  const validCategories = ['skills', 'strength', 'mobility', 'street-workout'];
  if (!category || !validCategories.includes(category)) {
    errors.push('Category must be either: skills, strength, mobility, or street-workout.');
  }

  const parsedDuration = Number(durationWeeks);
  if (isNaN(parsedDuration) || parsedDuration <= 0) {
    errors.push('Duration (weeks) must be a positive number.');
  }

  if (!Array.isArray(equipmentNeeded)) {
    errors.push('Equipment needed must be an array of strings.');
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    errors.push('Exercises must be an array with at least one exercise.');
  } else {
    exercises.forEach((ex: any, idx: number) => {
      if (!ex.name || typeof ex.name !== 'string') errors.push(`Exercise [${idx + 1}]: Name is required.`);
      if (isNaN(Number(ex.sets)) || Number(ex.sets) <= 0) errors.push(`Exercise [${idx + 1}]: Sets must be a positive number.`);
      if (isNaN(Number(ex.restSeconds)) || Number(ex.restSeconds) < 0) errors.push(`Exercise [${idx + 1}]: Rest seconds must be a valid number.`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function getPrograms(req: AuthRequest, res: Response) {
  try {
    const { search, category, difficulty, sort, page, limit } = req.query;

    const filter: any = {};

    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && typeof category === 'string' && category !== 'all') {
      filter.category = category;
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    // Default sort: newest
    let sortObj: any = { createdAt: -1 };
    if (sort === 'rating') {
      sortObj = { rating: -1 };
    } else if (sort === 'duration') {
      sortObj = { durationWeeks: 1 };
    } else if (sort === 'newest') {
      sortObj = { createdAt: -1 };
    }

    const p = parseInt(page as string) || 1;
    const l = parseInt(limit as string) || 8;
    const skip = (p - 1) * l;

    const programsCollection = getCollection<Program>('programs');
    const items = await programsCollection.find(filter).sort(sortObj).skip(skip).limit(l).toArray();
    const total = await programsCollection.countDocuments(filter);

    res.json({
      items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching programs.' });
  }
}

export async function getProgramById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid program ID format.' });
    }

    const programObjId = new ObjectId(id);
    const programsCollection = getCollection<Program>('programs');
    
    const program = await programsCollection.findOne({ _id: programObjId });
    if (!program) {
      return res.status(404).json({ error: 'Program not found.' });
    }

    // Fetch related programs (same category or difficulty, excluding current one)
    const related = await programsCollection.find({
      _id: { $ne: programObjId },
      $or: [
        { category: program.category },
        { difficulty: program.difficulty }
      ]
    }).limit(3).toArray();

    res.json({
      program,
      related
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching program details.' });
  }
}

export async function createProgram(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const validation = validateProgramData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed.', details: validation.errors });
    }

    // Accept both 'description' (frontend/Atlas) and 'fullDescription' (legacy)
    const { title, shortDescription, description, fullDescription, coverImageUrl, difficulty, category, durationWeeks, equipmentNeeded, exercises } = req.body;
    const resolvedDescription = (description || fullDescription || '').trim();

    const formattedExercises: Exercise[] = exercises.map((ex: any, index: number) => ({
      name: ex.name.trim(),
      sets: Number(ex.sets),
      // Accept reps or holdDurationSeconds (optional)
      ...(ex.reps !== undefined && ex.reps !== '' ? { reps: Number(ex.reps) } : {}),
      ...(ex.holdDurationSeconds !== undefined && ex.holdDurationSeconds !== '' ? { holdDurationSeconds: Number(ex.holdDurationSeconds) } : {}),
      restSeconds: Number(ex.restSeconds),
      // Accept both formTip (frontend) and formNotes (legacy)
      formTip: (ex.formTip || ex.formNotes || '').trim(),
      order: index + 1
    }));

    const newProgram: Omit<Program, '_id'> = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: resolvedDescription,
      coverImageUrl: coverImageUrl.trim(),
      difficulty,
      category,
      durationWeeks: Number(durationWeeks),
      equipmentNeeded: Array.isArray(equipmentNeeded) ? equipmentNeeded.map((e: string) => e.trim()) : [],
      createdBy: new ObjectId(req.user.id),
      exercises: formattedExercises,
      rating: 5.0,
      createdAt: new Date()
    };

    const programsCollection = getCollection<Program>('programs');
    const result = await programsCollection.insertOne(newProgram as Program);
    
    const createdProgram = await programsCollection.findOne({ _id: result.insertedId });
    res.status(201).json(createdProgram);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating program.' });
  }
}

export async function deleteProgram(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid program ID format.' });
    }

    const programObjId = new ObjectId(id);
    const programsCollection = getCollection<Program>('programs');

    const program = await programsCollection.findOne({ _id: programObjId });
    if (!program) {
      return res.status(404).json({ error: 'Program not found.' });
    }

    // Verify ownership
    if (program.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You are not the owner of this program.' });
    }

    await programsCollection.deleteOne({ _id: programObjId });
    res.json({ success: true, message: 'Program deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting program.' });
  }
}

export async function getMyPrograms(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const programsCollection = getCollection<Program>('programs');
    const userPrograms = await programsCollection.find({
      createdBy: new ObjectId(req.user.id)
    }).sort({ createdAt: -1 }).toArray();

    res.json(userPrograms);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching your programs.' });
  }
}
