import { Router } from 'express';
import { getAdminStats, getAllUsers, toggleUserRole } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/adminMiddleware';

const router = Router();

// Protect ALL admin endpoints with BOTH JWT auth AND adminOnly middleware!
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', toggleUserRole);

export default router;