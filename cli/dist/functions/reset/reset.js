import fs from "fs";
import util from "util";
import child_process from "child_process";
import commandExists from "command-exists";
import chalk from "chalk";
import Mongo from "mongodb";
import ps from "ps-node";
import mongoUri from "mongo-uri-tool";
import Loader from "../../lib/loader.js";
import settings from "../../lib/settings.js";
const exec = util.promisify(child_process.exec);
const resetDatabase = async (mongodb) => {
  const collections = mongodb && mongodb.db && await mongodb.db.listCollections().toArray();
  for (let i = 0; i < collections.length; i += 1) {
    const collectionFromList = collections[i];
    const collectionName = collectionFromList && collectionFromList.name;
    const collection = collectionName && mongodb.db.collection(collectionName);
    if (collection) {
      await collection.deleteMany();
    }
  }
  return true;
};
const handleCleanup = (processIds = []) => {
  process.loader.stop();
  processIds.forEach((processId) => {
    ps.kill(processId);
  });
  process.exit();
};
const handleSignalEvents = (processIds = []) => {
  process.on("SIGINT", () => handleCleanup(processIds));
  process.on("SIGTERM", () => handleCleanup(processIds));
};
const getMongoProcessId = (stdout = null) => {
  const forkedProcessId = stdout && stdout.match(/forked process:+\s[0-9]+/gi);
  const processId = forkedProcessId && forkedProcessId[0] && forkedProcessId[0].replace("forked process: ", "");
  return processId && parseInt(processId, 10);
};
const getConnectionOptions = () => {
  const mongodbSettings = settings && settings.databases && settings.databases.mongodb;
  const uri = mongodbSettings && mongodbSettings.uri;
  if (!mongodbSettings || mongodbSettings && !uri) {
    throw new Error(
      chalk.redBright(
        "Must have a valid databases.mongodb.uri value in your settings-<env>.json file to connect to MongoDB."
      )
    );
  }
  return {
    uri,
    parsedUri: mongoUri.parseUri(uri),
    options: Object.assign({}, mongodbSettings.options)
  };
};
const connectToMongoDB = async () => {
  const connectionOptions = getConnectionOptions();
  if (!process.mongodb && connectionOptions) {
    const mongodb = await Mongo.MongoClient.connect(connectionOptions.uri, {
      poolSize: process.env.NODE_ENV === "development" ? 10 : 100,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: "admin",
      ssl: process.env.NODE_ENV !== "development",
      ...connectionOptions.options
    });
    const db = mongodb.db(connectionOptions.parsedUri.db);
    return {
      db,
      Collection: db.collection.bind(db),
      connection: mongodb
    };
  }
  return null;
};
const startMongoDB = async () => {
  const dataDirectoryExists = fs.existsSync(".data/mongodb");
  if (!dataDirectoryExists) {
    fs.mkdirSync(".data/mongodb", { recursive: true });
  }
  const { stdout } = await exec(
    "mongod --port 27017 --dbpath ./.data/mongodb --quiet --fork --logpath ./.data/mongodb/log"
  );
  const mongoProcessId = getMongoProcessId(stdout);
  process.mongoProcessId = mongoProcessId;
  return mongoProcessId;
};
const warnMongoDBMissing = () => {
  console.warn(`
  ${chalk.red("MongoDB not installed.")}

  ${chalk.green(
    "Download MongoDB at https://www.mongodb.com/try/download/community"
  )}

  After installation, try to run this command again to start MongoDB alongside your app.

  `);
};
const reset = async () => {
  if (process.env.NODE_ENV !== "development") {
    console.log(
      chalk.redBright(
        "To prevent catastrophic data loss, reset is disabled outside of your development environment."
      )
    );
    process.exit(1);
  }
  process.isReset = true;
  process.loader = new Loader();
  process.loader.print("Resetting database...");
  const mongodbExists = commandExists.sync("mongod");
  if (mongodbExists) {
    const mongoProcessId = await startMongoDB();
    handleSignalEvents([mongoProcessId]);
    const mongodb = await connectToMongoDB();
    await resetDatabase(mongodb);
    ps.kill(mongoProcessId);
    process.loader.print("Database reset!\n\n");
    process.exit();
  } else {
    process.loader.stop();
    warnMongoDBMissing();
    process.exit(1);
  }
};
(async () => reset())();
