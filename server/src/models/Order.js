import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    fullAddress: { type: String, required: true },
  },
  { _id: false }
);

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    address: { type: orderAddressSchema, required: true },

    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['razorpay'], default: 'razorpay' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'pending' },

    // Set if payment succeeded but we couldn't decrement stock for one
    // or more items (e.g. a race with another buyer). Money was
    // already taken, so the order still completes — this just flags
    // it for the admin to resolve (partial refund / backorder / etc.)
    // rather than silently overselling.
    flaggedForReview: { type: Boolean, default: false },
    reviewNote: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
