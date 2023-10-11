const createTable = async (table = "", tableColumns = []) => {
  return process.databases._sessions?.query(`CREATE TABLE IF NOT EXISTS ${table} (${tableColumns.join(", ")})`);
};
var createSessionsTables_default = async () => {
  await createTable("sessions", [
    "id bigserial primary key",
    "session_id text",
    "csrf text",
    "created_at text"
  ]);
};
export {
  createSessionsTables_default as default
};
