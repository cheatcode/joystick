import os from "os";
const isWindows = os.platform() === "win32";
var replaceForwardSlashesWithBackslashes_default = (path = "") => {
  return isWindows ? path.replace(/\//, "\\") : path;
};
export {
  replaceForwardSlashesWithBackslashes_default as default
};
