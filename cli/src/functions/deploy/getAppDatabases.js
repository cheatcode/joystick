import validateDatabasesFromSettings from "../../lib/validateDatabasesFromSettings.js";

export default (settings = {}) => {
  const databases = settings?.config?.databases;

  if (databases && Array.isArray(databases) && databases.length > 0) {
    validateDatabasesFromSettings(databases);

    return databases.map((database) => {
      return {
        [database?.provider]: {
          pid: null,
          connection: database?.connection || null,
          settings: database,
        },
      };
    });
  }

  return [];
};