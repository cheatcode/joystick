import http from 'http';
import api_accounts_authenticated from "./api/accounts/authenticated.js";
import api_accounts_login from "./api/accounts/login.js";
import api_accounts_logout from "./api/accounts/logout.js";
import api_accounts_recover_password from "./api/accounts/recover_password.js";
import api_accounts_reset_password from "./api/accounts/reset_password.js";
import api_accounts_signup from "./api/accounts/signup.js";
import api_accounts_user from "./api/accounts/user.js";
import api_accounts_verify_email from "./api/accounts/verify_email.js";
import api_push_health from './api/push/health.js';
import api_test_accounts_delete from "./api/test/accounts/delete.js";
import api_test_accounts_signup from "./api/test/accounts/signup.js";
import api_test_bootstrap from "./api/test/bootstrap.js";
import api_test_process from "./api/test/process.js";
import api_test_queues from "./api/test/queues.js";
import create_mongodb_indexes from "./databases/mongodb/create_indexes.js";
import create_postgresql_indexes from "./databases/postgresql/create_indexes.js";
import create_postgresql_tables from "./databases/postgresql/create_tables.js";
import dynamic_import from '../lib/dynamic_import.js';
import generate_machine_id from "./generate_machine_id.js";
import generate_process_id from "./generate_process_id.js";
import get_browser_safe_request from '../lib/get_browser_safe_request.js';
import get_joystick_build_path from '../lib/get_joystick_build_path.js';
import get_target_database_connection from "./databases/get_target_database_connection.js";
import handle_process_errors from "./handle_process_errors.js";
import load_settings from "./settings/load.js";
import parse_route_pattern from '../lib/parse_route_pattern.js';
import path_exists from '../lib/path_exists.js';
import push from "./push/index.js";
import push_logger from "./push/logger.js";
import Queue from "./queues/index.js";
import register_app_options from "./register_app_options.js";
import register_cron_jobs from "./cron_jobs/register.js";
import register_database from './databases/register_database.js';
import register_getters from "./api/register_getters.js";
import register_route_from_function from './routes/register_route_from_function.js';
import register_route_from_object from './routes/register_route_from_object.js';
import register_setters from "./api/register_setters.js";
import register_uploaders from "./uploaders/register.js";
import register_websockets from "./websockets/register.js";
import ssr from './ssr/index.js';
import start_express from "./start_express.js";
import start_node_as_cluster from "./start_node_as_cluster.js";
import strip_preceeding_slash from '../lib/strip_preceeding_slash.js';
import types from "../lib/types.js";

const app_settings = load_settings();

class App {
	constructor(app_options = {}) {
		http.globalAgent.maxSockets = Infinity;
		
		handle_process_errors(app_options?.events);

		register_app_options(this, app_options);

		this.generate_machine_id();
		this.generate_process_id();

		process.title = process.env.NODE_ENV === 'test' ? "joystick_test_app" : 'joystick_app';

		// NOTE: Make app_options passed to node.app() accessible globally. This is used
		// for things like the account hooks.
    process.joystick = {
      app_options,
      external_process_ids: [],
      track_external_process: (external_process_id = '') => {
      	process.send({ external_process_id });
      	process.joystick.external_process_ids.push(external_process_id);
      },
    };
	}

	async connect_databases() {
		const databases_from_settings = app_settings?.config?.databases;

		for (let i = 0; i < databases_from_settings?.length; i += 1) {
			const database_from_settings = databases_from_settings[i];
      const database_port = parseInt(process.env.PORT, 10) + 10 + i;
			const has_multiple_of_provider = (databases_from_settings?.filter((database) => database_from_settings?.provider === database?.provider))?.length > 1;

			await register_database(database_from_settings, database_port, has_multiple_of_provider);
		}

		if (databases_from_settings?.length > 0) {
			const queues_database = get_target_database_connection('queues');
			const sessions_database = get_target_database_connection('sessions');
			const users_database = get_target_database_connection('users');

	    process.databases._queues = queues_database?.connection;
	    process.databases._sessions = sessions_database?.connection;
	    process.databases._users = users_database?.connection;

	    const internal_database_targets = [queues_database, sessions_database, users_database];

	    const mongodb_targets = internal_database_targets?.filter((target) => target?.provider === 'mongodb')?.map((target) => target?.database_type);
	    await create_mongodb_indexes(mongodb_targets);

	    const postgresql_targets = internal_database_targets?.filter((target) => target?.provider === 'postgresql')?.map((target) => target?.database_type);
	    await create_postgresql_tables(postgresql_targets);
	    await create_postgresql_indexes(postgresql_targets);
		}
	}

	async generate_machine_id() {
		this.joystick_machine_id = await generate_machine_id();
	}

	async generate_process_id() {
		this.joystick_process_id = await generate_process_id();
	}

	on_after_start_server(express = {}) {
		// NOTE: Any console.log here is picked up by the stdout listener inside of
    // the start script of the CLI.
    process.on("message", (message) => {
      if (typeof message === 'string') {
        const parsed_message = JSON.parse(message);

        if (['RESTART'].includes(parsed_message?.type)) {

        }

        if (parsed_message?.type === 'BUILD_ERROR') {
          process.BUILD_ERROR = JSON.parse(message);
        }
      }
    });

    console.log(`App running at: http://localhost:${express.port}`);
	}

	register_accounts() {
		this.express.app.get('/api/_accounts/authenticated', api_accounts_authenticated);
		this.express.app.post('/api/_accounts/user', api_accounts_user);
		this.express.app.post('/api/_accounts/login', api_accounts_login);
		this.express.app.post('/api/_accounts/logout', api_accounts_logout);
		this.express.app.post('/api/_accounts/recover-password', api_accounts_recover_password);
		this.express.app.post('/api/_accounts/reset-password', api_accounts_reset_password);
		this.express.app.post('/api/_accounts/signup', api_accounts_signup);
		this.express.app.get('/api/_accounts/verify-email', api_accounts_verify_email);
	}

	register_api() {
    const getters = this?.options?.api?.getters;
    const setters = this?.options?.api?.setters;
    const api_options = this?.options?.api?.options;
    const api_context = this?.options?.api?.context;

    if (getters && types.is_object(getters) && Object.keys(getters || {}).length > 0) {
      register_getters(this.express.app, Object.entries(getters || {}), api_context, api_options);
    }

    if (setters && types.is_object(setters) && Object.keys(setters || {}).length > 0) {
      register_setters(this.express.app, Object.entries(setters || {}), api_context, api_options);
    }
	}

  register_caches() {
  	process.caches = {};

    if (types.is_function(this.options.caches)) {
      this.options.caches();
    }
  }

	register_cron_jobs() {
		register_cron_jobs(this.options.cronJobs || this.options.cron_jobs);
	}

	register_dynamic_pages() {
		this.express.app.post(`/_joystick/dynamic_page/data`, async (req = {}, res = {}) => {
			const joystick_build_path = get_joystick_build_path();
			const sanitized_component_path = strip_preceeding_slash(req?.body?.page);
			const file_path = `${joystick_build_path}/${sanitized_component_path}`;

			if (!req?.body?.page || !(await path_exists(file_path))) {
				return handle_api_error('joystick.dynamic_pages.load', new Error(`Component not found at ${file_path}.`), res);
			}

			const Component = await dynamic_import(file_path);

			if (Component) {
				const parsed_route = parse_route_pattern(req?.body?.route_pattern || '', req?.body?.path);

				const browser_safe_request = get_browser_safe_request({
					params: parsed_route?.params || {},
					query: req?.body?.query_params || {},
					url: req?.body?.path,
					headers: req?.headers,
					context: req?.context,
				});

				const data = await ssr({
					is_dynamic_page_render: true,
					component_to_render: Component,
					api_schema: this?.options?.api,
					component_options: {
						props: req?.body?.props,
					},
					req: browser_safe_request,
				});

				return res.status(200).send({
					data,
					req: browser_safe_request,
					url: {
						params: parsed_route?.params || {},
						query: req?.body?.query_params || {},
						path: req?.body?.path,
						route: req?.body?.route_pattern || req?.body?.path,
					},
				});
			}

			return res.status(200).send({});
		});
	}

  register_fixtures() {
    if (types.is_function(this.options.fixtures)) {
      this.options.fixtures();
    }
  }

  register_indexes() {
    if (types.is_function(this.options.indexes)) {
      this.options.indexes();
    }
  }

  async register_push() {
		if (process.env.NODE_ENV !== "development" && process.env.IS_PUSH_DEPLOYED) {
			await push_logger();
			await push();
		}
  }

  register_queues() {
    if (types.is_object(this.options.queues)) {
      const queue_definitions = Object.entries(this.options.queues || {});
      for (let i = 0; i < queue_definitions.length; i += 1) {
        const [queue_name, queue_options] = queue_definitions[i];
        process.queues = {
          ...(process.queues || {}),
          [queue_name]: new Queue(queue_name, queue_options),
        };
      }
    }
  }

	register_routes() {
		const routes = Object.entries(this?.options?.routes || {});

		for (let i = 0; i < routes?.length; i += 1) {
			const [route_path, route_handler] = routes[i];
			const is_object_route = types.is_object(route_handler);
			const is_function_route = types.is_function(route_handler);

			if (is_function_route) {
				register_route_from_function(this.express.app, route_path, route_handler);
			}

			if (is_object_route) {
				register_route_from_object(this.express.app, route_path, route_handler);
			}
		}
	}

	register_tests() {
		this.express.app.get('/api/_test/bootstrap', (req = {}, res = {}) => api_test_bootstrap(req, res, this));
		this.express.app.get('/api/_test/process', api_test_process);
		this.express.app.delete('/api/_test/accounts', api_test_accounts_delete);
		this.express.app.post('/api/_test/accounts/signup', api_test_accounts_signup);
		this.express.app.post('/api/_test/queues', (req = {}, res = {}) => api_test_queues(req, res, this));
	}

	register_uploaders() {
		register_uploaders(this.options.uploaders, this);
	}

	register_websockets() {
		register_websockets(this.options.websockets, this);
	}

	async start() {
		// NOTE: Order here is intentionally not alphabetical to ensure load
		// order plays nice with things like tests.
		this.register_push();
		await this.connect_databases();
		this.register_caches();
		this.register_cron_jobs();
		this.register_queues();
		this.start_express();
		this.register_tests();
		this.register_accounts();
		this.register_api();
		this.register_routes();
		this.register_dynamic_pages();
		this.register_websockets();
		this.register_uploaders();
		this.register_fixtures();
		this.register_indexes();
	}

	start_express() {
		this.express = start_express(this.on_after_start_server, this);
	}
}

const start_app = async (options = {}) => {
  const app = new App(options);
  await app.start(options);
  return app;
};

const app = (options = {}) => {
	return new Promise(async (resolve) => {
		if (options?.cluster) {
			start_node_as_cluster(async () => {
				const app = await start_app(options);
        return resolve(app.express);
			});
		} else {
			const app = await start_app(options);
      return resolve(app.express);
		}
	});
};

export default app;
