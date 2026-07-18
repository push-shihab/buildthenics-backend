import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  chatWithCoach,
  getRecommendations,
  logRecommendationInteraction
} from '../controllers/ai.controller';

const router = Router();

// All AI routes are protected by JWT auth
router.post('/chat', authMiddleware, chatWithCoach);
router.post('/recommendations', authMiddleware, getRecommendations);
router.post('/recommendations/interaction', authMiddleware, logRecommendationInteraction);

export default router;
