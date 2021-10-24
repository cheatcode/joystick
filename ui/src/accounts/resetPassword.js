import request from "./request";

export default (options = {}) => {
  return request("resetPassword", options);
};
