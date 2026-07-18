import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/types';

/**
 * Retrieves the current authenticated user's profile choices (goals, experience level, equipment)
 */
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Better Auth saves user data in singular 'user' collection
    const userColl = getCollection<User>('user');
    const user = await userColl.findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching user profile.' });
  }
}

/**
 * Updates the user's goals, experience level, and equipment selections
 */
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { goals, experienceLevel, equipment } = req.body;

    const userColl = getCollection<User>('user');
    
    // Prepare update parameters
    const updateDoc: Partial<User> = {};
    
    if (goals && Array.isArray(goals)) {
      updateDoc.goals = goals;
    }
    
    if (experienceLevel && ['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) {
      updateDoc.experienceLevel = experienceLevel;
    }
    
    if (equipment && Array.isArray(equipment)) {
      updateDoc.equipment = equipment;
    }

    await userColl.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: updateDoc }
    );

    const updatedUser = await userColl.findOne({ _id: new ObjectId(req.user.id) });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating user profile.' });
  }
}
