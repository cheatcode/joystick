import dayjs from 'dayjs';
import TuskDB from '@tuskdb/node';

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
      callback('uncaughtException', error);
    }
  });
};

const writeLogsToDisk = () => {
  const db = new TuskDB({
    file: {
      development: 'logs.json',
      production: '/root/logs.json', // NOTE: Assume we're writing to .json file in root of machine in production.
    }[process.env.NODE_ENV || 'development'],
    collections: {
      logs: [],
    },
  });

  captureLog((source = '', data = '') => {
    switch(source) {
      case 'stdout':
        return db.collection('logs').insertOne({
          error: false,
          timestamp: dayjs().format(),
          data,
        });
      case 'stderr':
      case 'uncaughtException':
        return db.collection('logs').insertOne({
          error: true,
          timestamp: dayjs().format(),
          data,
        });
      default:
        return;
    }
  });
};

export default () => {
  return writeLogsToDisk();
};