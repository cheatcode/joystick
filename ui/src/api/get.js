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

const get = (getter_name = "", getter_options = {}) => {
  if (typeof window.fetch !== 'undefined' && !getter_options?.skip) {
    // NOTE: Wrap fetch() with another Promise so we can control routing of errors
    // received in the response (by default they don't go to catch() which is where
    // get() should return errors).
    return new Promise((resolve, reject) => {
      const input = getter_options.input ? JSON.stringify(getter_options.input) : null;
      const output = getter_options.output ? JSON.stringify(getter_options.output) : null;
      const url = `${window.location.origin}/api/_getters/${getter_name}?input=${encodeURIComponent(input)}&output=${encodeURIComponent(output)}`;

      const headers = {
        ...(getter_options?.headers || {}),
      };

      if (window?.__joystick_test__) {
        headers.Cookie = generate_cookie_header({
          joystick_login_token: window.__joystick_test_login_token__,
          joystick_login_token_expires_at: window.__joystick_test_login_token_expires_at__,
        });
      }

      if (getter_options?.loader?.instance) {
        getter_options?.loader?.instance?.setState({ [getter_options?.loader?.state || `${getter_name}_loading`]: true });
      }

      return fetch(url, {
        method: 'GET',
        mode: "cors",
        headers,
        credentials: "include",
      }).then(async (response) => {
        const data_from_response = await handle_parse_response(response);

        if (getter_options?.loader?.instance) {
          getter_options?.loader?.instance?.setState({ [getter_options?.loader?.state || `${getter_name}_loading`]: false });
        }

        if (data_from_response?.errors) {
          log_request_errors(`Get request`, data_from_response.errors);
          return reject(data_from_response);
        }
    
        return resolve(data_from_response);
      }).catch((error) => {
        log_request_errors(`Get request`, [error]);

        if (getter_options?.loader?.instance) {
          getter_options?.loader?.instance?.setState({ [getter_options?.loader?.state || `${getter_name}_loading`]: false });
        }

        return reject({ errors: [error] });
      });
    });
  }

  return Promise.resolve();
};

export default get;
