const createIndex = async (indexName = '', tableName = '', tableColumns = []) => {
  return process.databases._sessions?.query(`CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${tableColumns.join(', ')})`);
};

export default async () => {
  await createIndex('session_by_id', 'sessions', ['session_id']);
  await createIndex('session_created_at', 'sessions', ['created_at']);
};
