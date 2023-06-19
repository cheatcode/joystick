import CLILog from "./CLILog.js";
import isObject from "./isObject.js";
var validateDatabasesFromSettings_default = (databases = []) => {
  const databasesNotAsObjects = databases.filter(
    (database) => !isObject(database)
  );
  const userDatabases = databases.filter((database) => !!database.users);
  const queueDatabases = databases.filter((database) => !!database.queues);
  const databasesWithDuplicateNames = databases.flatMap((database, index) => {
    return databases.map((currentDatabase, currentIndex) => {
      if (index === currentIndex)
        return null;
      if (currentDatabase.provider === database.provider) {
        return database;
      }
    });
  }).filter((database) => !!database);
  if (databasesNotAsObjects && databasesNotAsObjects.length > 0) {
    CLILog(`Please ensure that each database in the config.databases array in your settings.${process.env.NODE_ENV}.json is an object. Correct the array and restart your app.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#databases"
    });
    process.exit(1);
  }
  if (userDatabases && userDatabases.length > 1) {
    CLILog(`Please select a single database for your user accounts and restart your app.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#users-database"
    });
    process.exit(1);
  }
  if (queueDatabases && queueDatabases.length > 1) {
    CLILog(`Please select a single database for your queues and restart your app.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#queues-database"
    });
    process.exit(1);
  }
  if (databasesWithDuplicateNames && databasesWithDuplicateNames.length > 1) {
    CLILog(
      `Please only specify a database provider once. Remove any duplicates from the config.databases array in your settings.${process.env.NODE_ENV}.json and restart your app.`,
      {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick#databases"
      }
    );
    process.exit(1);
  }
  return true;
};
export {
  validateDatabasesFromSettings_default as default
};
