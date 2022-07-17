import path from 'path';

import winston, { format } from 'winston';

const logDirectory = path.join(__dirname, '..', '..', '..', 'logs');
const combinedLogFilepath = path.join(logDirectory, 'combined.log');
const accessLogFilepath = path.join(logDirectory, 'access.log');
const processingLogFilepath = path.join(logDirectory, 'processing.log');
const errorLogFilepath = path.join(logDirectory, 'error.log');

const consoleFormat = format.combine(
  format.timestamp(process.env.NODE_ENV !== 'production' ? { format: 'YYYY-MM-DD HH:mm:ss' } : undefined),
  format.errors({ stack: true }),
  format.printf(({ level, message, timestamp, stack }) => `[${timestamp}/${level.toUpperCase()}]: ${stack || message}`),
);

const fileFormat = format.combine(
  format.timestamp(),
  format.json(),
);

const errorFileFormat = format.combine(
  format.errors({ stack: true }),
  fileFormat,
);

export const ConsoleTransporter = new winston.transports.Console({ format: consoleFormat, level: 'info' });
export const AccessFileTransporter = new winston.transports.File({ format: fileFormat, filename: accessLogFilepath, level: 'info' });
export const ProcessingFileTransporter = new winston.transports.File({ format: fileFormat, filename: processingLogFilepath, level: 'info' });
export const CombinedFileTransporter = new winston.transports.File({ format: fileFormat, filename: combinedLogFilepath });
export const ErrorFileTransporter = new winston.transports.File({ format: errorFileFormat, filename: errorLogFilepath, level: 'error' });
