import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  avatar?: string;
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  createdAt: Date;
}

export interface Exercise {
  name: string;
  sets: number;
  // reps and holdDurationSeconds are both optional — one or the other is used
  reps?: string | number;
  holdDurationSeconds?: number;
  restSeconds: number;
  // Accept both formTip (frontend/Atlas) and formNotes (legacy)
  formTip?: string;
  formNotes?: string;
  muscleGroup?: string;
  videoUrl?: string;
  order?: number;
}

export interface Program {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  // Accept both 'description' (frontend/Atlas) and 'fullDescription' (legacy)
  description?: string;
  fullDescription?: string;
  coverImageUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'skills' | 'strength' | 'mobility' | 'street-workout';
  durationWeeks: number;
  equipmentNeeded: string[];
  createdBy?: ObjectId;
  exercises: Exercise[];
  rating: number;
  createdAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIChatHistory {
  _id?: ObjectId;
  userId: ObjectId;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface RecommendationInteraction {
  _id?: ObjectId;
  userId: ObjectId;
  programId: ObjectId;
  interactionType: 'viewed' | 'saved' | 'dismissed';
  timestamp: Date;
}
