import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Only set for provider: 'password' accounts (admins). select:false
    // so it's never accidentally returned from a find() — must be
    // explicitly requested with .select('+password').
    password: { type: String, select: false },

    // Present once the account has signed in with Google at least once.
    // sparse index — many admin accounts will never have this.
    firebaseUid: { type: String, unique: true, sparse: true },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    provider: { type: String, enum: ['google', 'password'], required: true },

    phone: { type: String, trim: true },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never leak the password hash even if a query forgets to exclude it.
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
