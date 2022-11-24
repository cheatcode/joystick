export default (table = '', columnName = '', columnSchema = '') => {
  return process.databases.postgresql.query(`ALTER TABLE ${table} ADD COLUMN ${columnName} ${columnSchema}`);
};