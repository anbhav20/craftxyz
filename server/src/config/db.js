import mongoose from 'mongoose';
import dns from 'node:dns';

// Windows + certain networks/VPNs: Node's own DNS resolver (c-ares) can
// fail to reach its configured DNS server with ECONNREFUSED on SRV
// lookups, even though the OS resolver (what `nslookup` uses) works
// fine. Pointing Node's resolver explicitly at public DNS sidesteps it.
// Harmless everywhere else. See: https://github.com/nodejs/node/issues/33812
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Opens the MongoDB connection. Called once from server.js before the
 * HTTP server starts listening — we never want the app to accept
 * requests before the DB is reachable.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[db] connected → ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
