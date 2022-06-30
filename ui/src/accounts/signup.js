import request from "./request";
import throwFrameworkError from '../lib/throwFrameworkError';

export default (options = {}) => {
  try {
    return request("signup", options);
  } catch (exception) {
    throwFrameworkError('accounts.signup', exception);
  }
};
