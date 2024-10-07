import types from "../../../lib/types.js";

const indexes = {
  // NOTE: queue indexes are set dynamically when initializing the queue in
  // app/databases/queries/<provider>/queues.js initialize_database function
  // to account for developer customization options.
  sessions: async () => {
    try {
      console.log('Starting index creation for sessions collection');
      await process.databases._sessions?.collection('sessions').createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 3600, background: true }
      );
      console.log('Successfully created index for sessions collection');
    } catch (exception) {
      console.error('Error creating index for sessions collection:', exception);
    }
  },
  users: async () => {
    const indexOperations = [
      { key: { emailAddress: 1 }, options: { background: true, unique: true } },
      { key: { username: 1 }, options: { background: true, unique: true } },
      { key: { 'sessions.token': 1 }, options: { background: true } },
      { key: { 'passwordResetTokens.token': 1 }, options: { background: true } },
      { key: { 'passwordResetTokens.token': 1, _id: 1 }, options: { background: true } },
      { key: { roles: 1 }, options: { background: true } },
      { key: { roles: 1, _id: 1 }, options: { background: true } },
    ];

    for (const { key, options } of indexOperations) {
      try {
        console.log(`Starting index creation for users collection: ${JSON.stringify(key)}`);
        await process.databases._users?.collection('users').createIndex(key, options);
        console.log(`Successfully created index for users collection: ${JSON.stringify(key)}`);
      } catch (exception) {
        console.error(`Error creating index for users collection ${JSON.stringify(key)}:`, exception);
      }
    }

    // Separate try-catch blocks for 'roles' collection
    try {
      console.log('Starting index creation for roles collection (role: 1)');
      await process.databases._users?.collection('roles').createIndex({ role: 1 }, { background: true });
      console.log('Successfully created index for roles collection (role: 1)');
    } catch (exception) {
      console.error('Error creating index for roles collection (role: 1):', exception);
    }

    try {
      console.log('Starting index creation for roles collection (role: 1, userId: 1)');
      await process.databases._users?.collection('roles').createIndex({ role: 1, userId: 1 }, { background: true });
      console.log('Successfully created index for roles collection (role: 1, userId: 1)');
    } catch (exception) {
      console.error('Error creating index for roles collection (role: 1, userId: 1):', exception);
    }
  },
};

const create_indexes = async (database_types_to_index = []) => {
  for (let i = 0; i < database_types_to_index?.length; i += 1) {
    const database_type = database_types_to_index[i];
    if (types.is_function(indexes[database_type])) {
      console.log(`Starting index creation for database type: ${database_type}`);
      await indexes[database_type]();
      console.log(`Completed index creation for database type: ${database_type}`);
    } else {
      console.warn(`No index creation function found for database type: ${database_type}`);
    }
  }
};

export default create_indexes;