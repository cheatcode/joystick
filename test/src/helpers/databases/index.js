import load_settings from "../../lib/load_settings.js";
import register_database from './register_database.js';
import get_test_port from '../../lib/get_test_port.js';

const settings = (load_settings())?.parsed;

const databases = async () => {
  const databases_from_settings = settings?.config?.databases;

  console.log({ databases_from_settings });

  for (let i = 0; i < databases_from_settings?.length; i += 1) {
    const database_from_settings = databases_from_settings[i];
    const database_port = parseInt(get_test_port(), 10) + 10 + i;
    console.log('test databases', database_port);
    const has_multiple_of_provider = (databases_from_settings?.filter((database) => database_from_settings?.provider === database?.provider))?.length > 1;
    await register_database(database_from_settings, database_port, has_multiple_of_provider);
  }

  return Promise.resolve(process.databases);
};

export default databases;
