import os from "os";
import fs from "fs";
var writeLoginTokenToDisk_default = (cookies = {}) => {
  const home = os.homedir();
  const loginPath = `${home}/.cheatcode`;
  if (!fs.existsSync(loginPath)) {
    fs.mkdirSync(loginPath, { recursive: true });
  }
  if (fs.existsSync(`${loginPath}/login`)) {
    fs.unlinkSync(`${home}/.cheatcode/login`);
  }
  fs.writeFileSync(`${home}/.cheatcode/login`, JSON.stringify(cookies, null, 2));
};
export {
  writeLoginTokenToDisk_default as default
};
