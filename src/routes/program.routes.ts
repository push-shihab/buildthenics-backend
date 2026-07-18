import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getPrograms,
  getProgramById,
  createProgram,
  deleteProgram,
  getMyPrograms
} from '../controllers/program.controller';

const router = Router();

// Protected routes
router.get('/manage', authMiddleware, getMyPrograms);
router.post('/', authMiddleware, createProgram);
router.delete('/:id', authMiddleware, deleteProgram);

// Public routes
router.get('/', getPrograms);
router.get('/:id', getProgramById);

export default router;
