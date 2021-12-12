import request from "./request";

export default async (options = {}) => {
  const response = await request("authenticated", options);
  return response?.status === 200 && response?.authenticated;
};
