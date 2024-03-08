import request from "./request.js";

const user = async (options = {}) => {
  const response = await request("user", options);
  return response?.status === 200 && response?.user;
};

export default user;
