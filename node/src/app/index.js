import http from 'http';
import fs from 'fs';
import api_accounts_authenticated from "./api/accounts/authenticated.js";
import api_accounts_login from "./api/accounts/login.js";
import api_accounts_logout from "./api/accounts/logout.js";
import api_accounts_recover_password from "./api/accounts/recover_password.js";
import api_accounts_reset_password from "./api/accounts/reset_password.js";
import api_accounts_signup from "./api/accounts/signup.js";
import api_accounts_user from "./api/accounts/user.js";
import api_accounts_verify_email from "./api/accounts/verify_email.js";
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
import get_translations from '../lib/get_translations.js';
import handle_process_errors from "./handle_process_errors.js";
import load_settings from "./settings/load.js";
import parse_route_pattern from '../lib/parse_route_pattern.js';
import path_exists from '../lib/path_exists.js';
import push from './push/index.js';
import push_logger from "./push/logger.js";
import Queue from "./queues/index.js";
import read_mod_component_css from '../lib/read_mod_component_css.js';
import read_mod_global_css from '../lib/read_mod_global_css.js';
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
import websocket_client from '../lib/websocket_client.js';

const { readFile, readdir } = fs.promises;
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
			const users_database = get_target_database_connection('users');

	    process.databases._queues = queues_database?.connection;
	    process.databases._users = users_database?.connection;

	    const internal_database_targets = [queues_database, users_database];

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

	async load_translations() {
		const joystick_build_path = get_joystick_build_path();
		
		if (!(await path_exists(joystick_build_path))) {
			return;
		}

		process._joystick_translations = {
			normal: {
				files: [],
				path: `${joystick_build_path}i18n`,
				cache: {}
			},
			email: {
				files: [],
				path: `${joystick_build_path}i18n/email`,
				cache: {}
			}
		};

		const load_translation_files = async (translation_type) => {
			const translation_config = process._joystick_translations[translation_type];
			
			if (!(await path_exists(translation_config.path))) {
				return;
			}

			try {
				const files = await readdir(translation_config.path);
				translation_config.files = files.filter(file => 
					file.endsWith('.js') && !file.startsWith('._')
				);

				for (const file of translation_config.files) {
					const file_path = `${translation_config.path}/${file}`;
					
					try {
						const translation_module = await dynamic_import(file_path);
						translation_config.cache[file] = translation_module;
					} catch (error) {
						console.warn(`Failed to load translation file: ${file_path}`, error.message);
					}
				}
			} catch (error) {
				console.warn(`Failed to scan translation directory: ${translation_config.path}`, error.message);
			}
		};

		await load_translation_files('normal');
		await load_translation_files('email');
	}

	async load_email_templates() {
		const joystick_build_path = get_joystick_build_path();
		const email_templates_path = `${joystick_build_path}email`;
		
		if (!(await path_exists(email_templates_path))) {
			return;
		}

		process._joystick_email_templates = {};
		process._joystick_email_base_files = {};

		try {
			const files = await readdir(email_templates_path);
			
			// Load email template components (.js files)
			const template_files = files.filter(file => 
				file.endsWith('.js') && !file.startsWith('._')
			);
			for (const file of template_files) {
				const file_path = `${email_templates_path}/${file}`;
				const template_name = file.replace('.js', '');
				
				try {
					const email_template_component = await dynamic_import(file_path);
					process._joystick_email_templates[template_name] = email_template_component;
				} catch (error) {
					console.warn(`Failed to load email template: ${file_path}`, error.message);
				}
			}

			// Load email base HTML and CSS files
			const base_files = files.filter(file => file.startsWith('base') && (file.endsWith('.html') || file.endsWith('.css')));
			for (const file of base_files) {
				const file_path = `${email_templates_path}/${file}`;
				
				try {
					const file_content = await readFile(file_path, 'utf-8');
					process._joystick_email_base_files[file] = file_content;
				} catch (error) {
					console.warn(`Failed to load email base file: ${file_path}`, error.message);
				}
			}
		} catch (error) {
			console.warn(`Failed to scan email templates directory: ${email_templates_path}`, error.message);
		}
	}

	async load_ui() {
		const joystick_build_path = get_joystick_build_path();
		
		if (!(await path_exists(joystick_build_path))) {
			return;
		}

		process._joystick_html = await readFile('index.html', 'utf-8');
		process._joystick_components = {};

		const scan_directory = async (directory_path) => {
			try {
				const entries = await readdir(directory_path, { withFileTypes: true });
				
				for (const entry of entries) {
					if (entry.isDirectory()) {
						const component_directory_path = `${directory_path}/${entry.name}`;
						const index_file_path = `${component_directory_path}/index.js`;
						
						if (await path_exists(index_file_path)) {
							try {
								const component = await dynamic_import(index_file_path);
								const relative_path = index_file_path.replace(`${joystick_build_path}`, '');
								
								process._joystick_components[relative_path] = component;
							} catch (error) {
								console.warn(`Failed to load component: ${index_file_path}`, error.message);
							}
						}
					}
				}
			} catch (error) {
				console.warn(`Failed to scan directory: ${directory_path}`, error.message);
			}
		};

		const component_directories = [
			`${joystick_build_path}ui/components`,
			`${joystick_build_path}ui/layouts`,
			`${joystick_build_path}ui/pages`
		];

		for (const directory_path of component_directories) {
			if (await path_exists(directory_path)) {
				await scan_directory(directory_path);
			}
		}
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

				// NOTE: Load translations for the dynamic page
				let i18n = {};
				try {
					const joystick_build_path = get_joystick_build_path();
					const language_files_path = `${joystick_build_path}i18n`;
					const language_files = process._joystick_translations?.normal?.files || [];

					if (language_files.length > 0) {
						i18n = await get_translations({
							req: browser_safe_request,
							language_files_path,
							language_files,
							render_component_path: sanitized_component_path,
						});
					}
				} catch (error) {
					console.warn('Failed to load translations for dynamic page:', error.message);
				}

				return res.status(200).send({
					data,
					req: browser_safe_request,
					url: {
						params: parsed_route?.params || {},
						query: req?.body?.query_params || {},
						path: req?.body?.path,
						route: req?.body?.route_pattern || req?.body?.path,
					},
					i18n,
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

	async register_mod() {
		// NOTE: Load Mod's CSS and maps into memory on server startup so they're readily
		// accessible during SSR (skips the need to reload on each SSR attempt).
		const mod_exists = await path_exists('private/mod');

		if (!mod_exists) {
			return;
		}

		// NOTE: Value will be a string of 'free' or 'plus'.
		const mod_version = (
			await path_exists('private/mod/mod_version.txt') &&
			(await readFile('private/mod/mod_version.txt', 'utf-8'))?.trim()
		) || 'free';

		let mod_light;
		let mod_dark;
		let mod_js;
		let globals = {};
		let components = {};

		if (mod_version === 'plus') {
			mod_light = (await path_exists('private/mod/mod-light-plus.min.css') && await readFile('private/mod/mod-light-plus.min.css', 'utf-8')) || '';
			mod_dark = (await path_exists('private/mod/mod-dark-plus.min.css') && await readFile('private/mod/mod-dark-plus.min.css', 'utf-8')) || '';
			mod_js = {
				esm: (await path_exists('lib/mod-plus.esm.min.js') && await readFile('lib/mod-plus.esm.min.js', 'utf-8')) || '',
				iife: (await path_exists('lib/mod-plus.iife.min.js') && await readFile('lib/mod-plus.iife.min.js', 'utf-8')) || '',
			};
			
			globals = await read_mod_global_css();
			const free_components = await read_mod_component_css('free');
			const plus_components = await read_mod_component_css('plus');
			
			components = {
				...(free_components || {}),
				...(plus_components || {}),
			};
		} else {
			mod_light = (await path_exists('private/mod/mod-light.min.css') && await readFile('private/mod/mod-light.min.css', 'utf-8')) || '';
			mod_dark = (await path_exists('private/mod/mod-dark.min.css') && await readFile('private/mod/mod-dark.min.css', 'utf-8')) || '';
			mod_js = {
				esm: (await path_exists('lib/mod.esm.min.js') && await readFile('lib/mod.esm.min.js', 'utf-8')) || '',
				iife: (await path_exists('lib/mod.iife.min.js') && await readFile('lib/mod.iife.min.js', 'utf-8')) || '',
			};

			globals = await read_mod_global_css();
			const free_components = await read_mod_component_css('free');

			components = {
				...(free_components || {}),
			};
		}

		this.mod = {
			version: mod_version,
			css: {
				light: mod_light,
				dark: mod_dark,
			},
			js: mod_js,
			globals,
			components,
		};
	}

  async register_push() {
		if (process.env.NODE_ENV !== "development" && process.env.IS_PUSH_DEPLOYED) {
			this.express.app.get(`/api/_push/health`, async (req = {}, res = {}) => {
				if (req?.headers?.['x-push-instance-token'] !== process.env.PUSH_INSTANCE_TOKEN) {
					return res.status(403).send('403 - You are not allowed to access this endpoint.');
				} else {
					return res.status(200).send('ok');
				}
			});

			process.push_instances_websocket = websocket_client({
				// NOTE: Safe to hardcode here as it won't be anything else, any time soon.
				url: 'wss://push.cheatcode.co/api/_websockets/instances',
				options: {
					max_sends_per_second: 10, // NOTE: Avoid log spam if an app has a loop.
					logging: false,
					auto_reconnect: true,
					// NOTE: Intentional as we want to avoid losing connections back to Push
					// at all costs (otherwise they'd have to do a redeploy).
					reconnect_attempts: Infinity,
					reconnect_delay_in_seconds: 10,
				},
			});

			await push();
			await push_logger();

			// NOTE: Intentionally fake this for Push deployed apps. This is because Express
			// is registered before Push's logging kicks in, so we don't get a 100% clean startup log.
			console.log(`App running at http://localhost:2600`);			
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
		// NOTE: Always run this first so we can cache translations in memory.
		await this.load_translations();
		// NOTE: Always run this second so we can cache email templates in memory.
		await this.load_email_templates();
		// NOTE: Always run this third so we can cache UI components in memory.
		await this.load_ui();
		// NOTE: Order here is intentionally not alphabetical to ensure load
		// order plays nice with things like tests.
		await this.connect_databases();
		// NOTE: Always keep Mod stuff early so we can use it in other locations below.
		await this.register_mod();
		this.register_caches();
		this.register_cron_jobs();
		this.register_queues();
		this.start_express();
		this.register_websockets();
		this.register_tests();
		this.register_push();
		this.register_accounts();
		this.register_api();
		this.register_routes();
		this.register_dynamic_pages();
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
