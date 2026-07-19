import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/users/me/addresses */
export const listAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  new ApiResponse(200, { addresses: user.addresses }).send(res);
});

/** POST /api/users/me/addresses */
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  // First saved address becomes the default automatically.
  const makeDefault = req.body.isDefault || user.addresses.length === 0;
  if (makeDefault) user.addresses.forEach((addr) => (addr.isDefault = false));

  user.addresses.push({ ...req.body, isDefault: makeDefault });
  await user.save();

  new ApiResponse(201, { addresses: user.addresses }, 'Address added').send(res);
});

/** PATCH /api/users/me/addresses/:addressId */
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('Address not found');

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();

  new ApiResponse(200, { addresses: user.addresses }, 'Address updated').send(res);
});

/** DELETE /api/users/me/addresses/:addressId */
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('Address not found');

  const wasDefault = address.isDefault;
  address.deleteOne();

  // Keep exactly one default address around if any remain.
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  new ApiResponse(200, { addresses: user.addresses }, 'Address removed').send(res);
});
