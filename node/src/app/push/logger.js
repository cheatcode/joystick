import winston from 'winston';
import fs from 'fs';
import path from 'path';
import path_exists from '../../lib/path_exists.js';
import generate_id from '../../lib/generate_id.js';
import push_encrypt from '../../lib/push_encrypt.js';
import ExternalTransport from './external_transport.js';
import websocket_client from '../../lib/websocket_client.js';

const { mkdir } = fs.promises;

const encrypt_message = winston.format((info) => {
  return {
    ...info,
    message: push_encrypt(info.message, process.env.PUSH_INSTANCE_TOKEN),
  };
});

const push_logs = async () => {
  const instance_token = process.env.PUSH_INSTANCE_TOKEN;

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
      }),
      new ExternalTransport({
        on_log: async (log = {}) => {
          process.push_instances_websocket.send({
            headers: { 'x-push-instance-token': instance_token },
            type: 'log',
            log: log,
          });
        },
      }),
    ],
  });

  // Helper function to get the caller's file and line number
  function get_caller_info() {
    if (process.env.PUSH_DEBUG !== 'true') return '';
    
    const original_prepare_stack_trace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const stack = new Error().stack;
    Error.prepareStackTrace = original_prepare_stack_trace;

    // Get caller's location (index 2 because 0 is this function and 1 is the write function)
    const caller = stack[2];
    const file_name = path.relative(process.cwd(), caller.getFileName());
    const line_number = caller.getLineNumber();
    return `[${file_name}:${line_number}] `;
  }

  // Helper function to format log message
  function format_log_message(data, caller_info) {
    const trimmedData = typeof data === 'string' && data.endsWith('\n') ? data.slice(0, -1) : data;
    return caller_info + trimmedData;
  }

  // Modify stdout.write
  process.stdout.write = (function(write) {
    return function(data) {
      const caller_info = get_caller_info();
      logger.info(format_log_message(data.toString(), caller_info));
      write.apply(process.stdout, arguments);
    };
  })(process.stdout.write);

  // Modify stderr.write
  process.stderr.write = (function(write) {
    return function(data) {
      const caller_info = get_caller_info();
      logger.error(format_log_message(data.toString(), caller_info));
      write.apply(process.stderr, arguments);
    };
  })(process.stderr.write);

  // Capture console.warn and log as 'warn' level
  const original_console_warn = console.warn;
  console.warn = function(...args) {
    const message = args.map((arg) => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    const caller_info = get_caller_info();
    logger.warn(format_log_message(message, caller_info));
    original_console_warn.apply(console, args);
  };

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    const caller_info = get_caller_info();
    logger.error(format_log_message(`Uncaught Exception: ${error instanceof Error ? error.stack : error}`, caller_info));
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (error) => {
    const caller_info = get_caller_info();
    logger.error(format_log_message(`Unhandled Rejection: ${error instanceof Error ? error.stack : error}`, caller_info));
  });
};

export default push_logs;
