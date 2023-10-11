import os from "os";
import fs, { cp } from "fs";
import colorLog from "../../lib/colorLog.js";
var logout_default = async () => {
  try {
    const home_directory = os.homedir();
    const session_token_path = `${home_directory}/.push/session_token`;
    const session_token_exists = fs.existsSync(session_token_path);
    if (session_token_exists) {
      fs.unlinkSync(session_token_path, "utf-8");
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
