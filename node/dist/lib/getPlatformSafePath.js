import os from "os";
const isWindows = os.platform() === "win32";
var getPlatformSafePath_default = (path = "") => {
  return isWindows ? path.replace("/", "\\") : path;
};
export {
  getPlatformSafePath_default as default
};
