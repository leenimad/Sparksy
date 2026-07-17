import { Router } from 'express';
import {
  generateProjectWorkspace,
  getUserProjects,
  getProjectById,
  updateTaskStatus,
  deleteProject,
  toggleSubtaskStatus,
  generateTaskTemplate,
   toggleProjectShare, 
  getPublicProjects,
  cloneProject,
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { projectSchema } from '../validations/projectValidation';

const router = Router();

router.use(protect);

router.post('/generate', validate(projectSchema), generateProjectWorkspace);
router.get('/', getUserProjects);
router.get('/public', getPublicProjects); 
router.get('/:id', getProjectById);
router.patch('/:id/tasks/:taskId', updateTaskStatus);
router.delete('/:id', deleteProject);
router.patch('/:id/tasks/:taskId/subtasks/:subtaskId', toggleSubtaskStatus);
router.post('/:id/tasks/:taskId/copilot', generateTaskTemplate);

router.patch('/:id/share', toggleProjectShare);
router.post('/:id/clone', cloneProject);
export default router;