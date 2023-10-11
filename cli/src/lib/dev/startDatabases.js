/* eslint-disable consistent-return */

import CLILog from "../CLILog.js";
import providerMap from "./databases/providerMap.js";
import { isObject } from '../types.js';

const startDatabaseProvider = async (
  environment = 'development',
  database = {},
  port = 2610,
  hasMultipleOfProvider = false
) => {
  try {
    const provider = providerMap[database?.provider];

    if (provider) {
      process.loader.print(`Starting ${provider?.name}${database?.name ? ` (${database?.name})`: ''}...`);

      process._databases = {
        ...(process._databases || {}),
        [database.provider]: !hasMultipleOfProvider ? await provider.connect(database, port, environment) : {
          ...((process._databases && process._databases[database.provider]) || {}),
          [database?.name || `${database.provider}_${port}`]: await provider.connect(database, port, environment)
        },
      };
    }

    return Promise.resolve(process._databases || {});
  } catch (exception) {
    throw new Error(`[startDatabases.startDatabaseProvider] ${exception.message}`);
  }
};

const startDatabaseProviders = async (databases = [], databasePortStart = 2610, environment = '') => {
  try {
    for (let i = 0; i < databases?.length; i += 1) {
      const database = databases[i];
      const hasMultipleOfProvider = (databases?.filter((database) => database?.provider === database?.provider))?.length > 1;

      await startDatabaseProvider(
        environment,
        database,
        // NOTE: Increment each database port using index in the databases array from settings if no port
        // is assigned in the settings.
        database?.port || databasePortStart + i,
        hasMultipleOfProvider,
      );
    }
  } catch (exception) {
    throw new Error(`[startDatabases.startDatabaseProviders] ${exception.message}`);
  }
};

const validateDatabasesFromSettings = (databases = []) => {
  try {
    const databasesNotAsObjects = databases.filter(
      (database) => !isObject(database)
    );

    const userDatabases = databases.filter((database) => !!database.users);
    const queueDatabases = databases.filter((database) => !!database.queues);
    const sessionDatabases = databases.filter((database) => !!database.sessions);

    if (databasesNotAsObjects && databasesNotAsObjects.length > 0) {
      CLILog(`Please ensure that each database in the config.databases array in your settings.${process.env.NODE_ENV}.json is an object. Correct the array and restart your app.`, {
        level: 'danger',
        docs: 'https://cheatcode.co/docs/joystick/cli/databases',
      });

      process.exit(1);
    }

    if (userDatabases && userDatabases.length > 1) {
      CLILog(`Please select a single database for your user accounts and restart your app.`, {
        level: 'danger',
        docs: 'https://cheatcode.co/docs/joystick/cli/databases#users',
      });

      process.exit(1);
    }

    if (queueDatabases && queueDatabases.length > 1) {
      CLILog(`Please select a single database for your queues and restart your app.`, {
        level: 'danger',
        docs: 'https://cheatcode.co/docs/joystick/cli/databases#queues',
      });

      process.exit(1);
    }

    if (sessionDatabases && sessionDatabases.length > 1) {
      CLILog(`Please select a single database for your sessions and restart your app.`, {
        level: 'danger',
        docs: 'https://cheatcode.co/docs/joystick/cli/databases#sessions',
      });

      process.exit(1);
    }

    return true;
  } catch (exception) {
    throw new Error(`[startDatabases.validateDatabasesFromSettings] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.environment) throw new Error('options.environment is required.');
    if (!options.port) throw new Error('options.port is required.');
    if (!options.settings) throw new Error('options.settings is required.');
  } catch (exception) {
    throw new Error(`[startDatabases.validateOptions] ${exception.message}`);
  }
};

const startDatabases = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    const databases = options?.settings?.config?.databases || [];

    if (databases?.length > 0) {
      validateDatabasesFromSettings(databases);
      await startDatabaseProviders(
        databases,
        options?.port + 10,
        options?.environment,
      );
    }

    resolve();
  } catch (exception) {
    reject(`[startDatabases] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    startDatabases(options, { resolve, reject });
  });
