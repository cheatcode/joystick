export default (table = '', columnName = '', columnSchema = '') => {
  return process.databases._users?.query(`ALTER TABLE ${table} ADD COLUMN ${columnName} ${columnSchema}`);
};