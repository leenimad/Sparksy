import { Router } from 'express';
import {
  generateProjectWorkspace,
  getUserProjects,
  getProjectById,
  updateTaskStatus,
  deleteProject,
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes here are protected and require a valid JWT token
router.use(protect);

router.post('/generate', generateProjectWorkspace); // Create
router.get('/', getUserProjects);                   // Read All
router.get('/:id', getProjectById);                 // Read One
router.patch('/:id/tasks/:taskId', updateTaskStatus); // Update Task Status
router.delete('/:id', deleteProject);               // Delete Project

export default router;