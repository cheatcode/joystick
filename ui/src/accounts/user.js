import request from "./request";

export default async (options = {}) => {
  const response = await request("user", options);
  return response?.status === 200 && response?.user;
};
