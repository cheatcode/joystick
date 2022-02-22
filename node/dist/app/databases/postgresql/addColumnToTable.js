var addColumnToTable_default = (table = "", columnName = "", columnSchema = "") => {
  return process.databases.postgresql.query(`ALTER TABLE ${table} ADD COLUMN ${columnName} ${columnSchema}`);
};
export {
  addColumnToTable_default as default
};
