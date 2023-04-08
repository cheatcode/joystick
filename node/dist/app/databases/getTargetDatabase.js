import loadSettings from "../../settings/load";
var getTargetDatabase_default = (databaseType = "users") => {
  const settings = loadSettings();
  const databases = settings?.config?.databases || [];
  const targetDatabase = databases.find((database) => !!database[databaseType]);
  return targetDatabase && targetDatabase.provider;
};
export {
  getTargetDatabase_default as default
};
