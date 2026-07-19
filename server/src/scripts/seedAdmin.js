import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';

/**
 * Creates (or updates the password of) the first admin account, from
 * SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME in .env.
 * Run once: `npm run seed:admin`. Safe to re-run — it upserts.
 */
async function run() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('[seed:admin] SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('[seed:admin] SEED_ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  await connectDB();

  let admin = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (admin) {
    admin.password = password; // pre-save hook re-hashes since it's modified
    admin.role = 'admin';
    admin.provider = 'password';
    await admin.save();
    console.log(`[seed:admin] updated existing account → ${email}`);
  } else {
    admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      provider: 'password',
    });
    console.log(`[seed:admin] created admin account → ${email}`);
  }

  await disconnectDB();
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed:admin] failed:', err);
  process.exit(1);
});
