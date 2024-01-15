import fs from "fs";
const { readFile } = fs.promises;
var validateInstanceToken_default = (instance_token_from_headers = "") => {
  return new Promise(async (resolve, reject) => {
    const instance_token_from_disk = await readFile("/root/push/instance_token.txt", "utf-8");
    const is_valid_token = instance_token_from_headers === instance_token_from_disk?.replace("\n", "");
    if (is_valid_token) {
      return resolve();
    } else {
      reject();
    }
  });
};
export {
  validateInstanceToken_default as default
};
