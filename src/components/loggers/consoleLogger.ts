import winston from 'winston';
import { CombinedFileTransporter, ConsoleTransporter, ErrorFileTransporter } from './transporters';

export const consoleLogger = winston.createLogger({
  defaultMeta: { environment: process.env.NODE_ENV },
  transports: [
    ConsoleTransporter,
    CombinedFileTransporter,
    ErrorFileTransporter,
  ],
});
