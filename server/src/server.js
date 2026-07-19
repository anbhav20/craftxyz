import 'dotenv/config';
import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[server] running on port ${PORT} (${process.env.NODE_ENV})`);
  });

  // Graceful shutdown — let in-flight requests finish, close the DB
  // connection cleanly, then exit. Matters on hosts that send SIGTERM
  // during deploys/restarts.
  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[server] unhandled rejection:', reason);
  });
}

start();
