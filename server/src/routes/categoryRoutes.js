import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidators.js';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

router.get('/', optionalAuth, categoryController.listCategories);
router.get('/:idOrSlug', categoryController.getCategory);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  '/:idOrSlug',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete('/:idOrSlug', requireAuth, requireAdmin, categoryController.deleteCategory);

export default router;
