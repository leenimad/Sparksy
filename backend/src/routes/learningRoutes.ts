import { Router } from 'express';
import { generateLearningPath } from '../controllers/learningController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect this route: only registered users with a JWT can generate learning paths
router.post('/generate', protect, generateLearningPath);

export default router;