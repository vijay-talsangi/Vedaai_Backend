import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export async function connectDatabase(): Promise<void> {
  let retries = 0;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err: Error) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(config.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      return;
    } catch (error) {
      retries++;
      const err = error instanceof Error ? error.message : String(error);
      logger.error(
        `MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${err}`
      );

      if (retries >= MAX_RETRIES) {
        logger.error('Max MongoDB connection retries reached. Exiting.');
        process.exit(1);
      }

      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    logger.error(`Error disconnecting MongoDB: ${err}`);
  }
}
