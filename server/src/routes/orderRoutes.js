import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateOrderStatusSchema } from '../validators/orderValidators.js';
import * as orderController from '../controllers/orderController.js';

const router = Router();

router.use(requireAuth);

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id', requireAdmin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
