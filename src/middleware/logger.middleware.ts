import morgan from 'morgan';
import winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.nodeEnv === 'production'
      ? winston.format.json()
      : winston.format.colorize(),
    config.nodeEnv !== 'production'
      ? winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      : winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    ...(config.nodeEnv === 'production'
      ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
         new winston.transports.File({ filename: 'logs/combined.log' })]
      : []),
  ],
});

// Morgan HTTP request logger
export const loggerMiddleware = morgan(
  config.nodeEnv === 'production' ? 'combined' : 'dev',
  { stream: { write: (msg: string) => logger.http(msg.trim()) } }
);
