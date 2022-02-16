import os from "os";
const isWindows = os.platform() === "win32";
var replaceBackslashesWithForwardSlashes_default = (path = "") => {
  return isWindows ? path.replace(/\\/g, "/") : path;
};
export {
  replaceBackslashesWithForwardSlashes_default as default
};
