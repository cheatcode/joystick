import connectMongoDB from './mongodb/connect.js';
import connectPostgreSQL from './postgresql/connect.js';

export default async (database = {}, databasePort = 2610) => {
  switch(database.provider) {
    case 'mongodb':
      process.loader.print("Starting MongoDB...");
      return connectMongoDB(database, databasePort);
    case 'postgresql':
      process.loader.print("Starting PostgreSQL...");
      return connectPostgreSQL(database, databasePort);
  }

  return Promise.resolve();
};
