const createUniqueIndex = async (indexName = '', tableName = '', tableColumns = []) => {
  return process.databases.postgresql.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${tableColumns.join(', ')})`);
};

const createIndex = async (indexName = '', tableName = '', tableColumns = []) => {
  return process.databases.postgresql.query(`CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${tableColumns.join(', ')})`);
};

export default async () => {
  // users
  await createIndex('user_by_email', 'users', ['email_address']);
  await createIndex('user_by_username', 'users', ['username']);
  await createIndex('user_by_user_id', 'users', ['user_id']);
  
  // users_sessions
  await createIndex('user_session_by_token', 'users_sessions', ['token']);

  // users_password_reset_tokens
  await createIndex('user_password_reset_token_by_token', 'users_password_reset_tokens', ['token']);
  await createIndex('user_password_reset_token_by_user_id_token', 'users_password_reset_tokens', ['user_id', 'token']);
 
  // users_roles
  await createIndex('user_role', 'users_roles', ['role']);
  await createIndex('user_roles_by_user_id_role', 'users_roles', ['user_id', 'role']);
  
  // roles
  await createIndex('role', 'roles', ['role']);
  await createUniqueIndex('user_roles', 'users_roles', ['user_id', 'role']);
};