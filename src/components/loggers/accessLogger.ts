import winston from 'winston';
import { AccessFileTransporter, CombinedFileTransporter, ErrorFileTransporter } from './transporters';

export const accessLogger = winston.createLogger({
  defaultMeta: { environment: process.env.NODE_ENV },
  transports: [
    AccessFileTransporter,
    CombinedFileTransporter,
    ErrorFileTransporter,
  ],
});
