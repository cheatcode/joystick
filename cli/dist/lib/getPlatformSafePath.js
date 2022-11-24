import isWindows from "./isWindows.js";
var getPlatformSafePath_default = (path = "") => {
  return isWindows ? path.replace("/", "\\") : path;
};
export {
  getPlatformSafePath_default as default
};
