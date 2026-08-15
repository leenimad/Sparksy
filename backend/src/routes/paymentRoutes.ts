import { Router } from 'express';
import { createCheckoutSession, verifyPaymentAndUnlock, processInAppPayment } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/create-checkout-session', createCheckoutSession);
router.post('/verify-session', verifyPaymentAndUnlock);
router.post('/process-inapp-payment', processInAppPayment);

export default router;