import app from './app';
import { config } from './config';
import { logger } from './middleware/logger.middleware';

const server = app.listen(config.port, () => {
  logger.info(`🚀 ${config.appName} running on port ${config.port} [${config.nodeEnv}]`);
  logger.info(`📚 API docs at http://localhost:${config.port}/api-docs`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});
