import { MongoClient } from "mongodb";
import { MEGABYTE } from "../lib/constants.js";
const connect_mongodb = async () => {
  const client = await MongoClient.connect("mongodb://localhost:27017");
  const db = client.db("push");
  await db.collection("logs").drop();
  const existing_collections = (await db.listCollections().toArray())?.map((collection) => collection?.name);
  const has_logs_collection = existing_collections?.includes("logs");
  if (!has_logs_collection) {
    await db.createCollection("logs", { capped: true, size: MEGABYTE * 50, max: 1e3 });
  }
  const logs_index = (await db.collection("logs").listIndexes().toArray())?.find((index) => index?.name === "timestamp_1");
  if (!logs_index) {
    await db.collection("logs").createIndex({ timestamp: 1 });
  }
  return db;
};
var connectMongoDB_default = connect_mongodb;
export {
  connectMongoDB_default as default
};
