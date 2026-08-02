import { Router } from 'express';
import { registerUser, loginUser,getUserToolbox, toggleUserTool, getMe
    , updateProfile, 
    changePassword,
} from '../controllers/authController';
import { validate } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validations/authValidation';
import { protect } from '../middleware/authMiddleware'; 

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe); 
router.get('/toolbox', protect, getUserToolbox);
router.patch('/toolbox', protect, toggleUserTool);
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);
router.patch('/password', protect, validate(changePasswordSchema), changePassword);
export default router;