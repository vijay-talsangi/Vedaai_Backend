import { createRequire } from 'node:module';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const require = createRequire(import.meta.url);

const Redis = require('ioredis') as any;

let redisInstance: any = null;

export function createRedisConnection(): any {
  const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times: number): number | null {
      if (times > 10) {
        logger.error('Redis max retries reached. Stopping reconnection.');
        return null;
      }
      const delay = Math.min(times * 200, 5000);
      logger.info(`Redis reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  redis.on('ready', () => {
    logger.info('Redis ready');
  });

  redis.on('error', (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Redis error: ${message}`);
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redis;
}

export function getRedis(): any {
  if (!redisInstance) {
    redisInstance = createRedisConnection();
  }
  return redisInstance;
}

export async function disconnectRedis(): Promise<void> {
  if (redisInstance) {
    try {
      await redisInstance.quit();
      redisInstance = null;
      logger.info('Redis disconnected gracefully');
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      logger.error(`Error disconnecting Redis: ${err}`);
    }
  }
}
