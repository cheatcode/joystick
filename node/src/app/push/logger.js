import winston from 'winston';
import fs from 'fs';
import path_exists from '../../lib/path_exists.js';
import generate_id from '../../lib/generate_id.js';
import push_encrypt from '../../lib/push_encrypt.js';

const { mkdir } = fs.promises;

const encrypt_message = winston.format((info) => {
  return {
    ...info,
    message: push_encrypt(info.message, process.env.PUSH_INSTANCE_TOKEN),
  };
});

const push_logs = async () => {
  if (!(await path_exists('/root/push/logs'))) {
    await mkdir('/root/push/logs', { recursive: true });
  }

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      encrypt_message(),
      winston.format((info) => {
        info._id = generate_id(16);
        return info;
      })(),      
      winston.format.json(),
    ),
    transports: [
      new winston.transports.File({
        filename: '/root/push/logs/app.log',
        maxsize: 1024 * 1024 * 10, // 10MB,
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
