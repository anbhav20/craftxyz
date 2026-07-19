import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    websiteName: { type: String, default: 'CraftXYZ' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    shippingCharge: { type: Number, default: 50, min: 0 },
    // Orders at or above this subtotal ship free. null = always charge shippingCharge.
    freeShippingThreshold: { type: Number, default: null },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);
