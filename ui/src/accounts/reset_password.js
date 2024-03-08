import request from "./request.js";

const reset_password = (options = {}) => {
  return request("reset-password", options);
};

export default reset_password;
