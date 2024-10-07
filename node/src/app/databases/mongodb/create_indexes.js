import types from "../../../lib/types.js";

const indexes = {
	// NOTE: queue indexes are set dynamically when initializing the queue in
	// app/databases/queries/<provider>/queues.js initialize_database function
	// to account for developer customization options.
	sessions: async () => {
	  await process.databases._sessions?.collection('sessions').createIndex('sessions', { _id: 1 });
	  await process.databases._sessions?.collection('sessions').createIndex('sessions', { createdAt: 1 }, { expireAfterSeconds: 3600 });
	},
	users: async () => {
	  // Users
	  await process.databases._users?.collection('users').createIndex({ _id: 1 });
	  await process.databases._users?.collection('users').createIndex({ emailAddress: 1 });
	  await process.databases._users?.collection('users').createIndex({ username: 1 });
	  await process.databases._users?.collection('users').createIndex({ 'sessions.token': 1 });
	  await process.databases._users?.collection('users').createIndex({ 'passwordResetTokens.token': 1 });
	  await process.databases._users?.collection('users').createIndex({ 'passwordResetTokens.token': 1, _id: 1 });
	  await process.databases._users?.collection('users').createIndex({ roles: 1 });
	  await process.databases._users?.collection('users').createIndex({ roles: 1, _id: 1 });
	  await process.databases._users?.collection('roles').createIndex({ role: 1 });
	  await process.databases._users?.collection('roles').createIndex({ role: 1, userId: 1 });
	},
};

const create_indexes = async (database_types_to_index = []) => {
	for (let i = 0; i < database_types_to_index?.length; i += 1) {
		const database_type = database_types_to_index[i];
		if (types.is_function(indexes[database_type])) {
			try {
				await indexes[database_type]();
			} catch (exception) {
				console.warn(exception);
			}
		}
	}
};

export default create_indexes;
