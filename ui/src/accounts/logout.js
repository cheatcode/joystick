import request from "./request";
import throwFrameworkError from '../lib/throwFrameworkError';

export default () => {
  try {
    return request("logout");
  } catch (exception) {
    throwFrameworkError('accounts.logout', exception);
  }
};
