import types from "../../../lib/types.js";

const create_table = (target_database = '', table_name = '', table_columns = []) => {
  return process.databases[target_database]?.query(
    `CREATE TABLE IF NOT EXISTS ${table_name} (${table_columns.join(", ")})`
  );
};

const tables = {
	// NOTE: queue tables are created dynamically when initializing the queue in
	// app/databases/queries/<provider>/queues.js initialize_database function
	// to account for dynamic table names.
	users: async () => {
	  await create_table('_users', 'users', [
	    'id bigserial primary key',
	    'user_id text',
	    'email_address text',
	    'password text',
	    'username text',
	    'language text',
	  ]);

	  await create_table('_users', 'users_sessions', [
	    'id bigserial primary key',
	    'user_id text',
	    'token text',
	    'token_expires_at text',
	  ]);

	  await create_table('_users', 'users_password_reset_tokens', [
	    'id bigserial primary key',
	    'user_id text',
	    'token text',
	    'requested_at text',
	  ]);

	  await create_table('_users', 'users_verify_email_tokens', [
	    'id bigserial primary key',
	    'user_id text',
	    'token text',
	  ]);

	  await create_table('_users', 'roles', ['id bigserial primary key', 'role text']);

	  await create_table('_users', 'users_roles', [
	    'id bigserial primary key',
	    'user_id text',
	    'role text',
	  ]);
	},
};

const create_tables = async (database_types_to_index = []) => {
	for (let i = 0; i < database_types_to_index?.length; i += 1) {
		const database_type = database_types_to_index[i];
		if (types.is_function(tables[database_type])) {
			await tables[database_type]();
		}
	}
};

export default create_tables;
