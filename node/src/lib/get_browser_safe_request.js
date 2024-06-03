import escape_key_value_pair from "./escape_key_value_pair.js";
import get_browser_safe_user from '../app/accounts/get_browser_safe_user.js';

const get_browser_safe_request = (req = {}) => {
  const browser_safe_request = {};

  browser_safe_request.headers = req.headers;
  browser_safe_request.params = escape_key_value_pair(req.params);
  browser_safe_request.query = escape_key_value_pair(req.query);
  browser_safe_request.context = {
    user: get_browser_safe_user(req.context.user),
  };
  browser_safe_request.url = req?.url;

  return browser_safe_request;
};

export default get_browser_safe_request;
