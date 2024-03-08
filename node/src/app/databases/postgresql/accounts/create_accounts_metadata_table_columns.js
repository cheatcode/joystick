import escape from 'pg-escape';

const create_accounts_metadata_table_columns = async (users_database = '', sqlized_metadata = {}) => {
  if (users_database === 'postgresql') {
    const columns = Object.keys(sqlized_metadata || {});
    
    for (let i = 0; i < columns?.length; i += 1) {
      await process.databases.postgresql.query(
        escape(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS %I TEXT;`,
          columns[i],
        ),
      );
    }
  }
};

export default create_accounts_metadata_table_columns;