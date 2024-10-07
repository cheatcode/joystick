import types from "../../../lib/types.js";

const indexes = {
  // NOTE: queue indexes are set dynamically when initializing the queue in
  // app/databases/queries/<provider>/queues.js initialize_database function
  // to account for developer customization options.
  sessions: async () => {
    try {
      const session_collection = process.databases._sessions?.collection('sessions');
      if (session_collection) {
        const existing_indexes = await session_collection.listIndexes().toArray();
        
        if (!existing_indexes.some(index => index.key._id === 1)) {
          await session_collection.createIndex({ _id: 1 });
        }
        
        if (!existing_indexes.some(index => index.key.createdAt === 1 && index.expireAfterSeconds === 3600)) {
          await session_collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
        }
      }
    } catch (exception) {
      console.warn(exception);
    }
  },
  users: async () => {
    try {
      const user_collection = process.databases._users?.collection('users');
      const role_collection = process.databases._users?.collection('roles');
      
      if (user_collection) {
        const existing_user_indexes = await user_collection.listIndexes().toArray();
        
        const user_indexes_to_create = [
          { _id: 1 },
          { emailAddress: 1 },
          { username: 1 },
          { 'sessions.token': 1 },
          { 'passwordResetTokens.token': 1 },
          { 'passwordResetTokens.token': 1, _id: 1 },
          { roles: 1 },
          { roles: 1, _id: 1 }
        ];

        for (const index of user_indexes_to_create) {
          if (!existing_user_indexes.some(existing_index => JSON.stringify(existing_index.key) === JSON.stringify(index))) {
            await user_collection.createIndex(index);
          }
        }
      }

      if (role_collection) {
        const existing_role_indexes = await role_collection.listIndexes().toArray();
        
        const role_indexes_to_create = [
          { role: 1 },
          { role: 1, userId: 1 }
        ];

        for (const index of role_indexes_to_create) {
          if (!existing_role_indexes.some(existing_index => JSON.stringify(existing_index.key) === JSON.stringify(index))) {
            await role_collection.createIndex(index);
          }
        }
      }
    } catch (exception) {
      console.warn(exception);
    }
  },
};

const create_indexes = async (database_types_to_index = []) => {
  for (let i = 0; i < database_types_to_index?.length; i += 1) {
    const database_type = database_types_to_index[i];
    if (types.is_function(indexes[database_type])) {
      await indexes[database_type]();
    }
  }
};

export default create_indexes;