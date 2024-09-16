import winston from 'winston';
import fs from 'fs';
import path_exists from '../lib/path_exists.js';
import push_encrypt from '../lib/push_encrypt.js';

const { mkdir } = fs.promises;

const encrypt_message = winston.format((info) => {
  if (info.message) {
    // Debug: Log the original message
    console.log('Original message:', info.message);
    
    // Ensure message is a string
    const messageString = typeof info.message === 'string' 
      ? info.message 
      : JSON.stringify(info.message);
    
    // Apply encryption
    info.message = push_encrypt(messageString, process.env.PUSH_INSTANCE_TOKEN);
    
    // Debug: Log the encrypted message
    console.log('Encrypted message:', info.message);
  }
  return info;
});

const push_logs = async () => {
  if (!(await path_exists('/root/push/logs'))) {
    await mkdir('/root/push/logs', { recursive: true });
  }

  // Debug: Log the encryption key (be careful with this in production!)
  console.log('Encryption key:', process.env.PUSH_INSTANCE_TOKEN);

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      encrypt_message(),
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

  // Wrap the original write methods
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;

  process.stdout.write = (data) => {
    logger.info(data);
    return originalStdoutWrite.call(process.stdout, data);
  };

  process.stderr.write = (data) => {
    logger.error(data);
    return originalStderrWrite.call(process.stderr, data);
  };
  
  process.on('uncaughtException', (error) => {
    logger.error(error instanceof Error ? error?.toString() : error);
  });

  process.on('unhandledRejection', (error) => {
    logger.error(error instanceof Error ? error?.toString() : error);
  });
};

export default push_logs;