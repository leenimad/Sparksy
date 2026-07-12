import { Router } from 'express';
import { registerUser, loginUser,getUserToolbox, toggleUserTool} from '../controllers/authController';
import { validate } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema } from '../validations/authValidation';
import { protect } from '../middleware/authMiddleware'; 

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

router.get('/toolbox', protect, getUserToolbox);
router.patch('/toolbox', protect, toggleUserTool);

export default router;