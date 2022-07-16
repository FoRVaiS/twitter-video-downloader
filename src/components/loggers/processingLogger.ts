import winston from 'winston';
import { CombinedFileTransporter, ConsoleTransporter, ErrorFileTransporter, ProcessingFileTransporter } from './transporters';

export const processingLogger = winston.createLogger({
  defaultMeta: { environment: process.env.NODE_ENV },
  transports: [
    ConsoleTransporter,
    ProcessingFileTransporter,
    CombinedFileTransporter,
    ErrorFileTransporter,
  ],
});
