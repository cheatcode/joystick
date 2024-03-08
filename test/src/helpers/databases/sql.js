const sql = {
  create_table: (options = {}) => {
    const columns = Object.entries(options?.columns)?.map(([column_name, column_type]) => {
      return `${column_name} ${column_type}`;
    })?.join(',');

    return {
      statement: `CREATE TABLE IF NOT EXISTS ${options?.table} (${columns})`,
      columns,
    };
  },
  add_column: (options = {}) => {
    return {
      statement: `ALTER TABLE ${options?.table} ADD COLUMN IF NOT EXISTS ${options?.column_name} ${options?.column_type}`,
    };
  },
  select: (options = {}) => {
    const column_names = Array.isArray(options?.columns) ? options?.columns?.join(',') : '*';
    const whereEntries = Object.entries(options?.where);
    const where = whereEntries?.map(([key], index) => {
        return `${key} = $${index + 1}`;
    })?.join(',');

    return {
      statement: `SELECT ${column_names} FROM ${options?.table} ${options?.where ? `WHERE ${where}` : ''}`,
      column_names,
      where,
      values: Object.values(options?.where),
    };
  },
  insert: (options = {}) => {
    const column_names = Object.keys(options?.data)?.join(',');
    const value_placeholders = Object.keys(options?.data)?.map((_, index) => `$${index + 1}`)?.join(',');
    
    return {
      statement: `INSERT INTO ${options?.table} (${column_names}) VALUES (${value_placeholders})`,
      column_names,
      value_placeholders,
      values: Object.values(options?.data),
    };
  },
  update: (options = {}) => {
    const whereEntries = Object.entries(options?.where);
    const sets = Object.keys(options?.data).map((key, index) => {
      return `${key} = $${whereEntries.length + index + 1}`;
    })?.join(',');
    const where = whereEntries?.map(([key], index) => {
        return `${key} = $${index + 1}`;
    })?.join(',');
  
    return {
      statement: `UPDATE ${options?.table} SET ${sets} WHERE ${where}`,
      sets,
      where,
      values: [
        ...(Object.values(options?.where)),
        ...(Object.values(options?.data))
      ],
    };
  },
};

export default sql;
