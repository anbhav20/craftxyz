import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidators.js';
import * as productController from '../controllers/productController.js';

const router = Router();

router.get('/', optionalAuth, productController.listProducts);
router.get('/:idOrSlug', optionalAuth, productController.getProduct);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.array('images', 6),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  '/:idOrSlug',
  requireAuth,
  requireAdmin,
  upload.array('images', 6),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete('/:idOrSlug', requireAuth, requireAdmin, productController.deleteProduct);

export default router;
