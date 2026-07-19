import { Router } from 'express';
import { authLimiter } from '../middleware/security.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { googleLoginSchema, adminLoginSchema } from '../validators/authValidators.js';
import { googleLogin, adminLogin, refresh, logout, me } from '../controllers/authController.js';

const router = Router();

router.post('/google', authLimiter, validate(googleLoginSchema), googleLogin);
router.post('/admin-login', authLimiter, validate(adminLoginSchema), adminLogin);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
