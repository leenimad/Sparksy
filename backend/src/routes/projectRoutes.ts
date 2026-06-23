import { Router } from 'express';
import {
  generateProjectWorkspace,
  getUserProjects,
  getProjectById,
  updateTaskStatus,
  deleteProject,
  toggleSubtaskStatus,
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { projectSchema } from '../validations/projectValidation';

const router = Router();

router.use(protect);

router.post('/generate', validate(projectSchema), generateProjectWorkspace);
router.get('/', getUserProjects);
router.get('/:id', getProjectById);
router.patch('/:id/tasks/:taskId', updateTaskStatus);
router.delete('/:id', deleteProject);
router.patch('/:id/tasks/:taskId/subtasks/:subtaskId', toggleSubtaskStatus);
export default router;