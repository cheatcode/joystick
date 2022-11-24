var getBuildPath_default = () => {
  if (process.env.NODE_ENV === "development") {
    return ".joystick/build/";
  }
  return "";
};
export {
  getBuildPath_default as default
};
