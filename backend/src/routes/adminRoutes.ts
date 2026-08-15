import { Router } from 'express';
import { getAdminStats, getAllUsers, toggleUserRole, getAdminGlobalAnalytics, } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/adminMiddleware';

const router = Router();

// Protect ALL admin endpoints with BOTH JWT auth AND adminOnly middleware!
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', toggleUserRole);

router.get('/analytics', getAdminGlobalAnalytics);

export default router;