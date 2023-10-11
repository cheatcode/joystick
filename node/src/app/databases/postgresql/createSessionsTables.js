const createTable = async (table = "", tableColumns = []) => {
  return process.databases._sessions?.query(
    `CREATE TABLE IF NOT EXISTS ${table} (${tableColumns.join(", ")})`
  );
};

export default async () => {
  await createTable("sessions", [
    "id bigserial primary key",
    "session_id text",
    "csrf text",
    "created_at text"
  ]);
};
