import request from "./request";

export default (options = {}) => {
  return request("login", options);
};
