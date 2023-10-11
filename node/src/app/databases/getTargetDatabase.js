import loadSettings from "../../settings/load";

// NOTE: Naively set default to users because that's the most common case.
export default (databaseType = 'users') => {
  const settings = loadSettings();
  const databases = settings?.config?.databases || [];
  const targetDatabase = databases.find((database) => !!database[databaseType]);
  return targetDatabase && targetDatabase.provider;
};