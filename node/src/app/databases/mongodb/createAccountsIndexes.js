const createIndex = async (collectionName = '', index = {}) => {
  return process.databases._users?.collection(collectionName).createIndex(index);
};

export default async () => {
  // users
  await createIndex('users', { _id: 1 });
  await createIndex('users', { emailAddress: 1 });
  await createIndex('users', { username: 1 });
  await createIndex('users', { 'sessions.token': 1 });
  await createIndex('users', { 'passwordResetTokens.token': 1 });
  await createIndex('users', { 'passwordResetTokens.token': 1, _id: 1 });
  await createIndex('users', { roles: 1 });
  await createIndex('users', { roles: 1, _id: 1 });

  // roles
  await createIndex('roles', { role: 1 });
  await createIndex('roles', { role: 1, userId: 1 });
};