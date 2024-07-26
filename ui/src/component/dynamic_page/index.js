import serialize_to_query_string from '../../lib/serialize_to_query_string.js';
import generate_cookie_header from '../../lib/generate_cookie_header.js';
import log_request_errors from '../../lib/log_request_errors.js';

const fetch_dynamic_data = (path = '', body = {}) => {
  return fetch(`/_joystick/dynamic_pages/${path}`, {
    method: 'GET',
    mode: "cors",
    headers: {
      'Content-Type': 'application/json',
      Cookie: generate_cookie_header({
        joystick_login_token: window.__joystick_test_login_token__,
        joystick_login_token_expires_at: window.__joystick_test_login_token_expires_at__,
      }),
    },
    credentials: "include",
    body: JSON.stringify(body || {}),
  }).then((response) => {
    return response.json();
  }).catch((error) => {
    log_request_errors(`joystick.dynamic_page.load.fetch_dynamic_data`, [error]);
    return { errors: [error] };
  });
};

const load_dynamic_page = async (component_instance = {}, dynamic_page_options = {}) => {
  const path_name = (dynamic_page_options?.path || '/')?.replace(location.origin, '');

  if (!dynamic_page_options?.page) {
    console.warn('[joystick.dynamic_page.load] Must pass a page to load.');
    return;
  }

  const page_component_file = (await import(`/_joystick/${dynamic_page_options?.page}?v=${new Date().getTime()}`))?.default;

  component_instance.props.page = page_component_file;
  component_instance.dynamic_page_props = dynamic_page_options?.props || {};

  const data_for_window = await fetch_dynamic_data(dynamic_page_options?.page, {
    path: dynamic_page_options?.page,
    route_pattern: dynamic_page_options?.route_pattern,
    query_params: dynamic_page_options?.query_params,
    props: dynamic_page_options?.props,
  });

  console.log({
    data_for_window,
  });

  if (dynamic_page_options?.path) {
    history.pushState(
      dynamic_page_options?.query_params,
      "",
      `${path_name}${
        dynamic_page_options?.query_params ?
          `?${serialize_to_query_string(dynamic_page_options?.query_params)}` :
          ''
        }`,
    );
  }

  component_instance.rerender();
};

const dynamic_page = {
  load: load_dynamic_page,
};

export default dynamic_page;