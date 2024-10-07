import types from "../../../lib/types.js";

const indexes = {
  // NOTE: queue indexes are set dynamically when initializing the queue in
  // app/databases/queries/<provider>/queues.js initialize_database function
  // to account for developer customization options.
  sessions: async () => {
    await process.databases._sessions?.collection('sessions').createIndex({ _id: 1 });
    await process.databases._sessions?.collection('sessions').createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
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
        await create_indexes_for_type(database_type);
      } catch (exception) {
        console.error(`Error creating indexes for ${database_type}:`, exception);
      }
    }
  }
};

async function create_indexes_for_type(database_type) {
  const db = process.databases[`_${database_type}`];
  if (!db) {
    return;
  }

  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    const existing_indexes = await db.collection(collection.name).indexes();
    const indexes_to_create = get_indexes_for_collection(database_type, collection.name);

    for (const index of indexes_to_create) {
      const index_exists = existing_indexes.some(existing_index => 
        JSON.stringify(existing_index.key) === JSON.stringify(index.key)
      );

      if (!index_exists) {
        await db.collection(collection.name).createIndex(index.key, index.options);
      }
    }
  }
}

function get_indexes_for_collection(database_type, collection_name) {
  const index_definitions = {
    sessions: [
      { key: { _id: 1 }, options: {} },
      { key: { createdAt: 1 }, options: { expireAfterSeconds: 3600 } }
    ],
    users: [
      { key: { _id: 1 }, options: {} },
      { key: { emailAddress: 1 }, options: {} },
      { key: { username: 1 }, options: {} },
      { key: { 'sessions.token': 1 }, options: {} },
      { key: { 'passwordResetTokens.token': 1 }, options: {} },
      { key: { 'passwordResetTokens.token': 1, _id: 1 }, options: {} },
      { key: { roles: 1 }, options: {} },
      { key: { roles: 1, _id: 1 }, options: {} }
    ],
    roles: [
      { key: { role: 1 }, options: {} },
      { key: { role: 1, userId: 1 }, options: {} }
    ]
  };

  return index_definitions[collection_name] || [];
}

export default create_indexes;