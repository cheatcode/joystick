import validateDatabasesFromSettings from "../../lib/validateDatabasesFromSettings.js";
var getAppDatabases_default = (settings = {}) => {
  const databases = settings?.config?.databases;
  if (databases && Array.isArray(databases) && databases.length > 0) {
    validateDatabasesFromSettings(databases);
    const appDatabases = {};
    databases.forEach((database) => {
      appDatabases[database?.provider] = {
        pid: null,
        connection: database?.connection || null,
        settings: database
      };
    });
    return appDatabases;
  }
  return {};
};
export {
  getAppDatabases_default as default
};
