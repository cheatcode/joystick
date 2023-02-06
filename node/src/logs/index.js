import fs from 'fs';
import SQLite3 from 'sqlite3';

/*
  TODO:

  - This is where the buffer/data log is coming from but not sure why. Some sort of erroneous log.
*/

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

const writeLogsToSQLite = () => {
  const sqlite3 = SQLite3.verbose();
  const db = new sqlite3.Database({
    development: 'logs.db',
    production: '/root/logs.db', // NOTE: Assume we're writing to .db file in root of machine in production.
  }[process.env.NODE_ENV || 'development']);

  // const sqlite = new SQLite('/root/logs.db');
  const createTable = db.prepare("CREATE TABLE IF NOT EXISTS logs (timestamp text, error integer, message text)");
  createTable.run();
  createTable.finalize();

  captureLog((source = '', data = '') => {
    const statement = db.prepare("INSERT INTO logs VALUES (?, ?, ?)");

    switch(source) {
      case 'stdout':
        return statement.run(new Date().toISOString(), 0, JSON.stringify(data));
      case 'stderr':
      case 'uncaughtException':
        return statement.run(new Date().toISOString(), 1, JSON.stringify(data));
      default:
        return;
    }
  });
};

const writeLogsToDisk = () => {
  const validLogsPath = process.env.LOGS_PATH && process.env.LOGS_PATH !== 'null';
  const logsPath = validLogsPath ? process.env.LOGS_PATH : './logs';

  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath);
  }
  
  if (!fs.existsSync(`${logsPath}/app.log`)) {
    fs.writeFileSync(`${logsPath}/app.log`, '');
  }
  
  const appLog = fs.createWriteStream(`${logsPath}/app.log`);

  captureLog((source = '', data = '') => {
    switch(source) {
      case 'stdout':
        return appLog.write(`{ "error": false, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace('\n', ''))} }\n`);
      case 'stderr':
        return appLog.write(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace('\n', ''))} }\n`);
      case 'uncaughtException':
        return console.error(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(((data && data.stack) ? data.stack : data))} }\n`);
      default:
        return;
    }
  });
};

export default () => {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  if (process.env.IS_PUSH_DEPLOYED !== 'true') {
    return writeLogsToDisk();
  }

  return writeLogsToSQLite();
};