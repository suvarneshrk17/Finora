import app from './app.js';
import { connectDB } from './config/db.js';
import { env, validateEnv } from './config/env.js';

async function bootstrap() {
  validateEnv();
  let dbReady = false;
  const server = app.listen(env.port, () => {
    console.log(`Finora API running on port ${env.port}`);
  });

  try {
    await connectDB();
    dbReady = true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }

  app.locals.dbReady = dbReady;

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down Finora API.`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start Finora API:', error);
  process.exit(1);
});
