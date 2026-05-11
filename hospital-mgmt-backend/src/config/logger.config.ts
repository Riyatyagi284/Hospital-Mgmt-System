import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  defaultMeta: {
    serviceName: 'Riya-Hospital-Mgmt-Backend',
  },

  transports: [
    new DailyRotateFile({
      dirname: 'logs/combinedLog',
      filename: 'application-%DATE%.log',
      level: 'info',

      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      dirname: 'logs/errorLog',
      filename: 'application-%DATE%.log',
      level: 'error',

      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

export default logger;
