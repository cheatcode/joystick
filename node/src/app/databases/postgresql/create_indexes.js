import cron from 'node-cron';
import types from "../../../lib/types.js";
import handle_cleanup_sessions from "./handle_cleanup_sessions.js";

const create_unique_index = async (target_database = '', index_name = '', table_name = '', table_columns = []) => {
  return process.databases[target_database]?.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${index_name} ON ${table_name}(${table_columns.join(', ')})`);
};

const create_index = async (target_database = '', index_name = '', table_name = '', table_columns = []) => {
  return process.databases[target_database]?.query(`CREATE INDEX IF NOT EXISTS ${index_name} ON ${table_name}(${table_columns.join(', ')})`);
};

const indexes = {
	// NOTE: queue indexes are set dynamically when initializing the queue in
	// app/databases/queries/<provider>/queues.js initialize_database function
	// to account for developer customization options.
	sessions: async () => {
	  await create_index('_sessions', 'session_by_id', 'sessions', ['session_id']);
	  await create_index('_sessions', 'session_created_at', 'sessions', ['created_at']);

	  // NOTE: Simulate a TTL index using cron to wipe out sessions older than 1 hour.
    cron.schedule('*/30 * * * * *', () => {
      handle_cleanup_sessions();
    });
	},
	users: async () => {
	  // users
	  await create_index('_users', 'user_by_email', 'users', ['email_address']);
	  await create_index('_users', 'user_by_username', 'users', ['username']);
	  await create_index('_users', 'user_by_user_id', 'users', ['user_id']);
	  
	  // users_sessions
	  await create_index('user_session_by_token', 'users_sessions', ['token']);

	  // users_password_reset_tokens
	  await create_index('_users', 'user_password_reset_token_by_token', 'users_password_reset_tokens', ['token']);
	  await create_index('_users', 'user_password_reset_token_by_user_id_token', 'users_password_reset_tokens', ['user_id', 'token']);
	 
	  // users_roles
	  await create_index('_users', 'user_role', 'users_roles', ['role']);
	  await create_index('_users', 'user_roles_by_user_id_role', 'users_roles', ['user_id', 'role']);
	  
	  // roles
	  await create_index('_users', 'role', 'roles', ['role']);
	  await create_unique_index('_users', 'user_roles', 'users_roles', ['user_id', 'role']);
	},
};

const create_indexes = async (database_types_to_index = []) => {
	for (let i = 0; i < database_types_to_index?.length; i += 1) {
		const database_type = database_types_to_index[i];
		if (types.is_function(indexes[database_type])) {
			await indexes[database_type]();
		}
	}
};

export default create_indexes;
