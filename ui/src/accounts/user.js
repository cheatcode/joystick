import request from "./request";
import throwFrameworkError from "../lib/throwFrameworkError";

export default async (options = {}) => {
  try {
    const response = await request("user", options);
    return response?.status === 200 && response?.user;
  } catch (exception) {
    throwFrameworkError('accounts.user', exception);
  }
};
