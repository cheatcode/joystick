import os from "os";
const isWindows = os.platform() === "win32";
var replaceFileProtocol_default = (path = "") => {
  return isWindows ? path.replace(/[a-zA-Z]:/gi, "") : path;
};
export {
  replaceFileProtocol_default as default
};
