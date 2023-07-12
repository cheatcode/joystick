import loadSettings from "../../settings/load";

// NOTE: Naively set default to users because that's the most common case.
export default (databaseType = 'users') => {
  const settings = loadSettings();
  const databases = settings?.config?.databases || [];
  const targetDatabaseIndex = databases.findIndex((database) => !!database[databaseType]);
  const targetDatabaseInSettings = databases[targetDatabaseIndex];
  
  if (!targetDatabaseInSettings) {
    return null;
  }
  
  const hasMultipleOfProvider = (databases?.filter((database) => database?.provider === targetDatabaseInSettings?.provider))?.length > 1;
  const databasePort = parseInt(process.env.PORT, 10) + 10 + targetDatabaseIndex;
  
  return {
    provider: targetDatabaseInSettings?.provider,
    connection: !hasMultipleOfProvider ?
      process.databases[targetDatabaseInSettings?.provider] :
      process.databases[targetDatabaseInSettings?.provider][targetDatabaseInSettings?.name || `${targetDatabaseInSettings?.provider}_${databasePort}`],
  };
};
