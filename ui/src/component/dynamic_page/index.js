import serialize_to_query_string from '../../lib/serialize_to_query_string.js';
import generate_cookie_header from '../../lib/generate_cookie_header.js';
import log_request_errors from '../../lib/log_request_errors.js';

const fetch_dynamic_data = (body = {}) => {
  return fetch(`/_joystick/dynamic_page/data`, {
    method: 'POST',
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

  // Store the new page and props that will be used during re-render
  const new_page = page_component_file;
  const new_dynamic_page_props = dynamic_page_options?.props || {};

  const data_for_window = await fetch_dynamic_data({
    path: path_name,
    page: dynamic_page_options?.page,
    route_pattern: dynamic_page_options?.route_pattern,
    query_params: dynamic_page_options?.query_params,
    props: dynamic_page_options?.props,
  });

  if (data_for_window?.data) {
    window.__joystick_data__ = {
      ...(window.__joystick_data__ || {}),
      ...(data_for_window?.data || {}),
    };

    window.__joystick_request__ = {
      ...(window.__joystick_request__ || {}),
      ...(data_for_window?.req || {}),
    };

    window.__joystick_url__ = {
      ...(window.__joystick_url__ || {}),
      ...(data_for_window?.url || {}),
    };

    // NOTE: Update i18n context for dynamic page transitions
    // This ensures translations work properly when navigating between pages
    if (data_for_window?.i18n) {
      window.__joystick_i18n__ = {
        ...(window.__joystick_i18n__ || {}),
        ...(data_for_window?.i18n || {}),
      };
    }
  }

  console.log({
    dynamic_page_options,
    data_for_window,
    data: window.__joystick_data__,
    req: window.__joystick_request__,
    url: window.__joystick_url__,
  })

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

  // NOTE: Clean up existing websocket connections before dynamic page transition
  // This prevents old page websockets from interfering with new page rendering
  if (window.joystick && window.joystick._internal && window.joystick._internal.websockets) {
    Object.keys(window.joystick._internal.websockets).forEach((component_id) => {
      const component_websockets = window.joystick._internal.websockets[component_id];
      if (component_websockets) {
        Object.keys(component_websockets).forEach((websocket_name) => {
          const websocket = component_websockets[websocket_name];
          if (websocket && websocket.close) {
            websocket.close();
          }
        });
      }
    });
    // NOTE: Clear the websockets tracking object after cleanup
    window.joystick._internal.websockets = {};
  }

  // Update the component's props and dynamic_page_props
  component_instance.props.page = new_page;
  component_instance.dynamic_page_props = new_dynamic_page_props;

  // Use queue_rerender() to test if order of operations fixes the websocket issue
  // while keeping websocket cleanup to prevent interference
  component_instance.queue_rerender();
};

const dynamic_page = {
  load: load_dynamic_page,
};

export default dynamic_page;
