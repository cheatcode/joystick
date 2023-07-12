import loadSettings from "../../settings/load";
var getTargetDatabaseProvider_default = (databaseType = "users") => {
  const settings = loadSettings();
  const databases = settings?.config?.databases || [];
  const targetDatabase = databases.find((database) => !!database[databaseType]);
  return targetDatabase && targetDatabase.provider;
};
export {
  getTargetDatabaseProvider_default as default
};
