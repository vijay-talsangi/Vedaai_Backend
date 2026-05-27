import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { disconnectRedis } from './config/redis.js';
import { setupSocket } from './sockets/socket.js';
import { initWorker } from './workers/assessment.worker.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import assignmentRoutes from './routes/assignment.routes.js';
import { logger } from './utils/logger.js';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create Express app
const app = express();

// CORS configuration
app.use(
  cors({
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'VedaAI Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/assignments', assignmentRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Setup Socket.io
const io = setupSocket(server);

// Initialize application
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('MongoDB connection established');

    // Initialize BullMQ worker (Redis connection is handled inside)
    try {
      const worker = initWorker(io);
      logger.info('BullMQ worker initialized');
    } catch (redisError) {
      const err = redisError instanceof Error ? redisError.message : String(redisError);
      logger.warn(
        `BullMQ worker initialization warning (Redis may not be available): ${err}`
      );
      logger.warn('App will continue without background job processing');
    }

    // Start server
    server.listen(config.PORT, () => {
      logger.info(`🚀 VedaAI Backend running on port ${config.PORT}`);
      logger.info(`📡 API: http://localhost:${config.PORT}/api`);
      logger.info(`🔌 Socket.io: http://localhost:${config.PORT}`);
      logger.info(`🏥 Health: http://localhost:${config.PORT}/api/health`);
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start server: ${err}`);
    process.exit(1);
  }
}

// Graceful shutdown
function gracefulShutdown(signal: string): void {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await disconnectDatabase();
    } catch (e) {
      // already logged inside
    }

    try {
      await disconnectRedis();
    } catch (e) {
      // already logged inside
    }

    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  logger.error(`Unhandled rejection: ${msg}`);
});

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

// Start the server
startServer();
