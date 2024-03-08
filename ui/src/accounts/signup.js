import request from "./request.js";

const signup = (options = {}) => {
  return request("signup", options);
};

export default signup;
