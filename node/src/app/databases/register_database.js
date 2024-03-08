import connect_mongodb from "./mongodb/connect.js";
import connect_postgresql from "./postgresql/connect.js";

const register_database = async (database_from_settings = {}, database_port = 2610, has_multiple_of_provider = false) => {
	if (database_from_settings?.provider === 'mongodb') {
		const mongodb_connection = await connect_mongodb(database_from_settings, database_port);
    process.databases = {
      ...(process.databases || {}),
      mongodb: !has_multiple_of_provider ? mongodb_connection : {
        ...(process?.databases?.mongodb || {}),
        [database_from_settings?.name || `mongodb_${database_port}`]: mongodb_connection,
      },
    };
	}

	if (database_from_settings?.provider === 'postgresql') {
		const postgresql_connection = await connect_postgresql(database_from_settings, database_port);
		process.databases = {
      ...(process.databases || {}),
      postgresql: !has_multiple_of_provider ? postgresql_connection : {
        ...(process?.databases?.postgresql || {}),
        [database_from_settings?.name || `postgresql_${database_port}`]: postgresql_connection,
      },
    };
	}

  return Promise.resolve(process.databases);
};

export default register_database;
