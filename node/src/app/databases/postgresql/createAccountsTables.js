const createTable = async (table = "", tableColumns = []) => {
  return process.databases.postgresql.query(
    `CREATE TABLE IF NOT EXISTS ${table} (${tableColumns.join(", ")})`
  );
};

export default async () => {
  await createTable("users", [
    "id bigserial primary key",
    "user_id text",
    "email_address text",
    "password text",
    "username text",
    "language text",
  ]);

  await createTable("users_sessions", [
    "id bigserial primary key",
    "user_id text",
    "token text",
    "token_expires_at text",
  ]);

  await createTable("users_password_reset_tokens", [
    "id bigserial primary key",
    "user_id text",
    "token text",
    "requested_at text",
  ]);

  await createTable("users_verify_email_tokens", [
    "id bigserial primary key",
    "user_id text",
    "token text",
  ]);

  await createTable("roles", ["id bigserial primary key", "role text"]);

  await createTable("users_roles", [
    "id bigserial primary key",
    "user_id text",
    "role text",
  ]);
};
