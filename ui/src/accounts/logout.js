import request from "./request.js";

const logout = () => {
  return request("logout");
};

export default logout;

