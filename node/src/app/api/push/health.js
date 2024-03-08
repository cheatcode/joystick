import fs from 'fs';

const { readFile } = fs.promises;

const health = async (req = {}, res = {}) => {
  const instance_token = await readFile("/root/push/instance_token.txt", "utf-8");

  if (req?.headers["x-instance-token"] === instance_token?.replace("\n", "")) {
    return res.status(200).send("ok");
  }

  return res
    .status(403)
    .send("Sorry, you must pass a valid instance token to access this endpoint.");
};

export default health;
