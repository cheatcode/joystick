import request from "./request.js";

const login = (options = {}) => {
  return request("login", options);
};

export default login;
