import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settingsValidators.js';
import { createAdminSchema } from '../validators/adminValidators.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/customers', adminController.listCustomers);
router.get('/settings', adminController.getSettings);
router.patch('/settings', validate(updateSettingsSchema), adminController.updateSettings);
router.get('/admins', adminController.listAdmins);
router.post('/admins', validate(createAdminSchema), adminController.createAdmin);

export default router;
