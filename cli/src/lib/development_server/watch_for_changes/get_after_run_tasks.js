import constants from "../../constants.js";
import get_platform_safe_path from "../../get_platform_safe_path.js";

const get_after_run_tasks = (path = '') => {
	const is_html_update = path === 'index.html';
  const is_client_index_update = path === 'index.client.js';
  const is_client_lib_update = path.includes(
    get_platform_safe_path('lib/')
  ) && !path.includes(
    get_platform_safe_path('lib/node')
  );
  const is_css_path = path.includes('css/');
  const is_i18n_path = path.includes('i18n');
  const is_settings_path = (path.match(constants.SETTINGS_FILE_NAME_REGEX))?.length > 0;
  const is_tests_path = path.includes(get_platform_safe_path('tests/'));
  const is_ui_path = path.includes(
    get_platform_safe_path("ui/")
  ) || path === 'index.css' || is_html_update || is_client_index_update || is_client_lib_update;
  const is_ui_update = (process.hmr_server_process && process.hmr_server_process.has_connections) &&
    (is_ui_path || is_i18n_path || is_settings_path) ||
    false;

  if (is_css_path) {
    return ['hot_module_reload'];
  }

  if (is_tests_path) {
    return ['run_tests'];
  }

  if (is_ui_update) {
    // NOTE: As part of hot_module_reload, the server will be restarted after a client has
    // signaled that the HMR update is complete (see handle_hmr_server_process_messages in
    // lib/development_server/index.js for the event handler).
  	return ['hot_module_reload'];
  }

  return ['restart_app_server'];
};

export default get_after_run_tasks;
