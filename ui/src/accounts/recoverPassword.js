import request from "./request";
import throwFrameworkError from "../lib/throwFrameworkError";

export default (options = {}) => {
  try {
    return request("recover-password", options);
  } catch (exception) {
    throwFrameworkError('accounts.recoverPassword', exception);
  }
};
