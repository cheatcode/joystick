import request from "./request";
import throwFrameworkError from "../lib/throwFrameworkError";

export default (options = {}) => {
  try {
    return request("reset-password", options);
  } catch (exception) {
    throwFrameworkError('accounts.resetPassword', exception);
  }
};
