import timestamps from '../../lib/timestamps';
import connectMongoDB from '../connectMongoDB.js';

const captureLog = (callback = null) => {
  process.stdout.write = (data) => {
    if (callback) {
      callback('stdout', data);
    }
  };

  process.stderr.write = (data) => {
    if (callback) {
      callback('stderr', data);
    }
  };
  
  process.on('uncaughtException', (error) => {
    if (callback) {
      // NOTE: Logger expects strings for data field. When receiving an error
      // object, attempt to parse out the message and fall back if none available.
      callback('uncaughtException', error?.message || 'Uncaught Exception');
    }
  });

  process.on('unhandledRejection', (error) => {
    if (callback) {
      // NOTE: Logger expects strings for data field. When receiving an error
      // object, attempt to parse out the message and fall back if none available.
      callback('unhandledRejection', error?.message || 'Unhandled Rejection');
    }
  });
};

export default async () => {
  const mongodb = await connectMongoDB();

  return captureLog(async (source = '', data = '') => {
    switch(source) {
      case 'stdout':
        return mongodb.collection('logs').insertOne({
          error: false,
          timestamp: timestamps.get_current_time(),
          process_id: process.pid,
          data,
        });
      case 'stderr':
      case 'uncaughtException':
      case 'unhandledRejection':
        return mongodb.collection('logs').insertOne({
          error: true,
          timestamp: timestamps.get_current_time(),
          process_id: process.pid,
          data,
        });
      default:
        return true;
    }
  });
};