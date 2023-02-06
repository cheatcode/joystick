import os from "os";
import fs, { cp } from "fs";
import colorLog from "../../lib/colorLog.js";
var logout_default = async () => {
  try {
    const homeDirectory = os.homedir();
    const sessionTokenPath = `${homeDirectory}/.cheatcode/session`;
    const sessionTokenExists = fs.existsSync(sessionTokenPath);
    if (sessionTokenExists) {
      fs.unlinkSync(sessionTokenPath, "utf-8");
      colorLog("\n\u2714 Logged out\n", "greenBright");
    }
    return true;
  } catch (exception) {
    throw new Error(`[logout] ${exception.message}`);
  }
};
export {
  logout_default as default
};
