import request from "./request.js";

const recover_password = (options = {}) => {
  return request("recover-password", options);
};

export default recover_password;
