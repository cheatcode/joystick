import SQLite3 from 'sqlite3';

const sqlite3 = SQLite3.verbose();
const db = new sqlite3.Database('/root/logs.db');

const run = (method, command) => {
  return new Promise((resolve, reject) => {
    db[method](command, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const prune = async () => {
  await run('run', `DELETE FROM logs WHERE datetime(timestamp) <= datetime('now', '-5 days');`);
  return true;
};

export default async (options = {}) => {
  const existingTable = await run('get', `SELECT name FROM sqlite_master WHERE type='table' AND name='logs'`);

  if (existingTable?.name === 'logs') {
    // NOTE: Always prune logs at retrieval time to keep the database light.
    prune();

    let query = "SELECT rowid AS id, timestamp, error, message FROM logs ORDER BY id desc LIMIT 100";

    if (options?.before && !options?.after) {
      query = `SELECT rowid AS id, timestamp, error, message FROM logs WHERE timestamp < '${options?.before}' ORDER BY id desc LIMIT 100`;
    }

    if (options?.after && !options?.before) {
      query = `SELECT rowid AS id, timestamp, error, message FROM logs WHERE timestamp > '${options?.after}' ORDER BY id desc LIMIT 100`;
    }

    const logs = await run('all', query);

    return logs;
  }
};