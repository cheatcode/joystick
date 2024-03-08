import log_request_errors from "../lib/log_request_errors.js";
import parse_json from "../lib/parse_json.js";

const handle_parse_response = async (response = {}) => {
  // NOTE: Parse as text and then pass to parse_json so Joystick can explicitly handle
  // invalid JSON errors.
  const response_as_text = await response.text();
  const data_from_response = parse_json(response_as_text);
  return data_from_response;
};

const get_body = (http_method = 'GET', endpoint_options = {}) => {
  const requests_with_body = ['POST'];

  if (requests_with_body.includes(http_method)) {
    return JSON.stringify({
      ...endpoint_options,
      origin: window?.location?.origin,
    });
  }

  return null;
};

const get_http_method = (endpoint = null) => {
  switch(endpoint) {
    case 'authenticated':
      return 'GET';
    case 'user':
    default:
      return 'POST';
  }
};

const request = (endpoint = "", endpoint_options = {}) => {
  if (typeof window.fetch !== 'undefined') {
    // NOTE: Wrap fetch() with another Promise so we can control routing of errors
    // received in the response (by default they don't go to catch() which is where
    // accounts methods should return errors).
    return new Promise((resolve, reject) => {
      const url = `${window.location.origin}/api/_accounts/${endpoint}`;
      const http_method = get_http_method(endpoint);
      const body = get_body(http_method, endpoint_options);

      return fetch(url, {
        method: http_method,
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        credentials: "include",
      }).then(async (response) => {
        const data_from_response = await handle_parse_response(response);

        if (data_from_response?.errors) {
          log_request_errors(`accounts.${endpoint}`, data_from_response.errors);
          return reject(data_from_response);
        }
    
        return resolve(data_from_response);
      }).catch((error) => {
        log_request_errors(`accounts.${endpoint}`, [error]);
        return reject({ errors: [error] });
      });
    });
  }
};

export default request;