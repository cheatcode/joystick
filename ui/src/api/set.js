import generate_cookie_header from "../lib/generate_cookie_header.js";
import log_request_errors from "../lib/log_request_errors.js";
import parse_json from "../lib/parse_json.js";

const handle_parse_response = async (response = {}) => {
  // NOTE: Parse as text and then pass to parse_json so Joystick can explicitly handle
  // invalid JSON errors.
  const response_as_text = await response.text();
  const data_from_response = parse_json(response_as_text);
  return data_from_response;
};

const get_body = (setter_options = {}) => {
  const sanitized_setter_options = { ...setter_options };

  if (sanitized_setter_options?.loader) {
    delete sanitized_setter_options.loader;
  }

  return JSON.stringify(sanitized_setter_options);
};

const set = (setter_name = "", setter_options = {}) => {
  if (typeof window.fetch !== 'undefined') {
    // NOTE: Wrap fetch() with another Promise so we can control routing of errors
    // received in the response (by default they don't go to catch() which is where
    // set() should return errors).
    return new Promise((resolve, reject) => {
      const url = `${window.location.origin}/api/_setters/${setter_name}`;
      const body = get_body(setter_options);

      const headers = {
        ...(setter_options?.headers || {}),
        "Content-Type": "application/json",
      };

      if (window?.__joystick_test__) {
        headers.Cookie = generate_cookie_header({
          joystick_login_token: window?.__joystick_test_login_token__,
          joystick_login_token_expires_at: window.__joystick_test_login_token_expires_at__,
        });
      }

      if (setter_options?.loader?.instance) {
        setter_options?.loader?.instance?.setState({ [setter_options?.loader?.state || `${setter_name}_loading`]: true });
      }

      return fetch(url, {
        method: 'POST',
        mode: "cors",
        headers,
        body,
        credentials: "include",
      }).then(async (response) => {
        const data_from_response = await handle_parse_response(response);
        if (setter_options?.loader?.instance) {
          setter_options?.loader?.instance?.setState({ [setter_options?.loader?.state || `${setter_name}_loading`]: false });
        }

        if (data_from_response?.errors) {
          log_request_errors(`Set request`, data_from_response.errors);
          return reject(data_from_response);
        }

        return resolve(data_from_response);
      }).catch((error) => {
        log_request_errors(`Set request`, [error]);

        if (setter_options?.loader?.instance) {
          setter_options?.loader?.instance?.setState({ [setter_options?.loader?.state || `${setter_name}_loading`]: false });
        }

        return reject({ errors: [error] });
      });
    });
  }

  return Promise.resolve();
};

export default set;
