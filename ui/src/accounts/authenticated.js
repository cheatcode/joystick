import request from "./request";
import throwFrameworkError from "../lib/throwFrameworkError";

export default async (options = {}) => {
  try {
    const response = await request("authenticated", options);
    return response?.status === 200 && response?.authenticated;
  } catch (exception) {
    throwFrameworkError('accounts.authenticated', exception);
  }
};
