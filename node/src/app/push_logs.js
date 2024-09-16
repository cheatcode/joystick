import winston from 'winston';
import fs from 'fs';
import path_exists from '../lib/path_exists.js';
import push_encrypt from '../lib/push_encrypt.js';

const { mkdir } = fs.promises;

const encrypt_message = winston.format((info) => {
  if (info.message) {
    info.message = push_encrypt(info.message, process.env.PUSH_INSTANCE_TOKEN);
  }

  return info;
});

const push_logs = async () => {
  if (!(await path_exists('/root/push/logs'))) {
    await mkdir('/root/push/logs', { recursive: true });
  }

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      encrypt_message,
      winston.format.json(),
    ),
    transports: [
      new winston.transports.File({
        filename: '/root/push/logs/app.log',
        maxsize: 1024 * 1024 * 5, // 5MB,
        maxFiles: 1,
        tailable: true,
      })
    ],
  });

  process.stdout.write = (data) => {
    logger.info(data);
  };

  process.stderr.write = (data) => {
    logger.error(data);
  };
  
  process.on('uncaughtException', (error) => {
    logger.error(error instanceof Error ? error?.toString() : error);
  });

  process.on('unhandledRejection', (error) => {
    logger.error(error instanceof Error ? error?.toString() : error);
  });
};

export default push_logs;
