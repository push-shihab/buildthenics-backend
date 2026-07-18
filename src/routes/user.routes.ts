import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

// Profile endpoints are protected by JWT auth
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
