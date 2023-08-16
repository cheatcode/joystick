import loadSettings from "../../lib/loadSettings.js";
import connectMongoDB from './mongodb/index.js';
import connectPostgreSQL from './postgresql/index.js';

export default async () => {
  const settings = (await loadSettings({ environment: 'test' }))?.parsed;

  const databases = settings?.config?.databases?.map((database) => {
    return {
      provider: database?.provider,
      settings: database,
    };
  });

  for (
    let databaseIndex = 0;
    databaseIndex < databases?.length;
    databaseIndex += 1
    ) {
    const database = databases[databaseIndex];
    const hasMultipleOfProvider = (databases?.filter((database) => database?.provider === database?.provider))?.length > 1;
    const databasePort = parseInt(process.env.PORT, 10) + 10 + databaseIndex;

    if (database?.provider === "mongodb") {
      const mongodb = await connectMongoDB(database?.settings, databasePort);
      process.databases = {
        ...(process.databases || {}),
        mongodb: !hasMultipleOfProvider ? mongodb : {
          ...(process?.databases?.mongodb || {}),
          [database?.settings?.name || `mongodb_${databasePort}`]: mongodb,
        },
      };
    }

    if (database?.provider === "postgresql") {
      const postgresql = await connectPostgreSQL(
        database?.settings,
        databasePort
        );

      process.databases = {
        ...(process.databases || {}),
        postgresql: !hasMultipleOfProvider ? {
          ...postgresql?.pool,
          query: postgresql?.query,
        } : {
          ...(process?.databases?.postgresql || {}),
          [database?.settings?.name || `postgresql_${databasePort}`]: {
            ...postgresql?.pool,
            query: postgresql?.query,
          },
        },
      };
    }
  }

  return process.databases;
};
