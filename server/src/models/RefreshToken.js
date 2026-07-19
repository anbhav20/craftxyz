import mongoose from 'mongoose';

/**
 * We store a SHA-256 hash of each issued refresh token, never the raw
 * token. On refresh/logout we hash the incoming cookie value and look
 * it up here. This is what makes "logout" and rotation actually mean
 * something — a stolen but-not-yet-used JWT can be invalidated by
 * deleting its row, even though the JWT itself would otherwise still
 * verify until it expires.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB TTL index — documents are auto-deleted once expiresAt passes,
// so expired sessions don't pile up and don't need a cron job.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
