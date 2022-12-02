import fs from "fs";
var getBuildPath_default = () => {
  if (process.env.NODE_ENV === "development" || fs.existsSync(".joystick/build")) {
    return ".joystick/build/";
  }
  return "";
};
export {
  getBuildPath_default as default
};
