import request from "./request.js";

const authenticated = async (options = {}) => {
  const response = await request("authenticated", options);
  return response?.status === 200 && response?.authenticated;
};

export default authenticated;
