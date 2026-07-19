import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addToCartSchema, updateQuantitySchema } from '../validators/cartValidators.js';
import * as cartController from '../controllers/cartController.js';

const router = Router();

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.patch('/item/:productId', validate(updateQuantitySchema), cartController.updateItemQuantity);
router.delete('/item/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
