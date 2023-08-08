import fs from "fs";
var getBuildPath_default = () => {
  if (["development", "test"].includes(process.env.NODE_ENV) || fs.existsSync(".joystick/build")) {
    return ".joystick/build/";
  }
  return "";
};
export {
  getBuildPath_default as default
};
