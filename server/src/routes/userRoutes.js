import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema, updateAddressSchema } from '../validators/userValidators.js';
import * as userController from '../controllers/userController.js';

const router = Router();

router.use(requireAuth);

router.get('/me/addresses', userController.listAddresses);
router.post('/me/addresses', validate(addressSchema), userController.addAddress);
router.patch('/me/addresses/:addressId', validate(updateAddressSchema), userController.updateAddress);
router.delete('/me/addresses/:addressId', userController.deleteAddress);

export default router;
