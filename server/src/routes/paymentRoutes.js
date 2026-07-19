import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPaymentOrderSchema, verifyPaymentSchema } from '../validators/paymentValidators.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.use(requireAuth);

router.post('/create-order', validate(createPaymentOrderSchema), paymentController.createPaymentOrder);
router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);

export default router;
