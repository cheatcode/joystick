import { MongoClient } from 'mongodb';
import { MEGABYTE } from '../lib/constants.js';

const connect_mongodb = async () => {
  // NOTE: We're anticipating a MongoDB instance on the Push deployed instance running
  // on the default 27017 port.
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('push');

  // NOTE: Because we call connect_mongodb on server startup, drop old collections to clear out
  // stale data before we reinit them.
  await db.collection('logs').drop();

  const existing_collections = (await db.listCollections().toArray())?.map((collection) => collection?.name);
  const has_logs_collection = existing_collections?.includes('logs');

  if (!has_logs_collection) {
    await db.createCollection('logs', { capped: true, size: MEGABYTE * 50, max: 1000 });
  }

  const logs_index = (await db.collection('logs').listIndexes().toArray())?.find((index) => index?.name === 'timestamp_1');

  if (!logs_index) {
    await db.collection('logs').createIndex({ timestamp: 1 });
  }

  return db;
};

export default connect_mongodb;
