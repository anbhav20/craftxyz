import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';

/**
 * Deletes every user with role: 'admin', along with their refresh
 * tokens and any outstanding password-reset tokens. Requires --yes
 * since this is irreversible — run `npm run seed:admin` afterward to
 * create a fresh one.
 */
async function run() {
  if (!process.argv.includes('--yes')) {
    console.error('[delete-admins] This permanently deletes every admin account.');
    console.error('Re-run with: npm run delete:admins -- --yes');
    process.exit(1);
  }

  await connectDB();

  const admins = await User.find({ role: 'admin' });

  if (admins.length === 0) {
    console.log('[delete-admins] No admin accounts found.');
  } else {
    const ids = admins.map((admin) => admin._id);
    await RefreshToken.deleteMany({ user: { $in: ids } });
    await PasswordResetToken.deleteMany({ user: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });

    console.log(`[delete-admins] Deleted ${admins.length} admin account(s):`);
    admins.forEach((admin) => console.log(`  - ${admin.email}`));
  }

  await disconnectDB();
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[delete-admins] failed:', err);
  process.exit(1);
});
