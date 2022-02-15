import os from "os";
const isWindows = os.platform() === "win32";
var getPlatformSafeFilePath_default = (path = "") => {
  return isWindows ? path.replace(/[a-zA-Z]:\\\\/, "file://") : path;
};
export {
  getPlatformSafeFilePath_default as default
};
