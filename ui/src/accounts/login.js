import request from "./request";
import throwFrameworkError from "../lib/throwFrameworkError";

export default (options = {}) => {
  try {
    return request("login", options);
  } catch (exception) {
    throwFrameworkError('accounts.login', exception);
  }
};
