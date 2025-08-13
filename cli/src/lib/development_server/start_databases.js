/* eslint-disable consistent-return */

import cli_log from "../cli_log.js";
import provider_map from "./databases/provider_map.js";
import types from '../types.js';

const start_database_provider = async (
  environment = 'development',
  database = {},
  port = 2610,
  has_multiple_of_provider = false
) => {
  const provider = provider_map[database?.provider];

  if (provider) {
    if (environment !== 'test') {
      process.loader.print(`Starting ${provider?.name}${database?.name ? ` (${database?.name})`: ''}...`);
    }

    process._databases = {
      ...(process._databases || {}),
      [database.provider]: !has_multiple_of_provider ? await provider.connect(database, port, environment) : {
        ...((process._databases && process._databases[database.provider]) || {}),
        [database?.name || `${database.provider}_${port}`]: await provider.connect(database, port, environment)
      },
    };
  }
};

const start_database_providers = async (databases = [], database_port = 2610, environment = '') => {
  for (let i = 0; i < databases?.length; i += 1) {
    const database = databases[i];
    const has_multiple_of_provider = (databases?.filter((database) => database?.provider === database?.provider))?.length > 1;

    await start_database_provider(
      environment,
      database,
      // NOTE: Increment each database port using index in the databases array from settings if no port
      // is assigned in the settings.
      database?.port || database_port + i,
      has_multiple_of_provider,
    );
  }
};

const validate_databases_from_settings = (databases = []) => {
  const databases_not_as_objects = databases.filter(
    (database) => !types.is_object(database)
  );

  const user_databases = databases.filter((database) => !!database.users);
  const queue_databases = databases.filter((database) => !!database.queues);
  const redis_user_databases = user_databases.filter((database) => database.provider === 'redis');

  if (databases_not_as_objects && databases_not_as_objects.length > 0) {
    cli_log(`Please ensure that each database in the config.databases array in your settings.${process.env.NODE_ENV}.json is an object. Correct the array and restart your app.`, {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli/databases',
    });

    process.exit(1);
  }

  if (redis_user_databases && redis_user_databases.length > 0) {
    cli_log(`Redis cannot be used for user accounts. Please use MongoDB or PostgreSQL for users and restart your app.`, {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli/databases#users',
    });

    process.exit(1);
  }

  if (user_databases && user_databases.length > 1) {
    cli_log(`Please select a single database for your user accounts and restart your app.`, {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli/databases#users',
    });

    process.exit(1);
  }

  if (queue_databases && queue_databases.length > 1) {
    cli_log(`Please select a single database for your queues and restart your app. If you need to spread queues across databases, use the database object on the queue definition instead (see documentation link below).`, {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli/databases#queues',
    });

    process.exit(1);
  }

  return true;
};

const start_databases = async (options = {}) => {
  const databases = options?.settings?.config?.databases || [];

  if (databases?.length > 0) {
    validate_databases_from_settings(databases);

    await start_database_providers(
      databases,
      options?.port + 10,
      options?.environment,
    );
  }
};

export default start_databases;
