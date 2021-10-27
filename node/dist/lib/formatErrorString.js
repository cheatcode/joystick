const formatErrorString = (location = "", error) => {
  const message = typeof error === "object" ? error.reason || error.message || error : error;
  return `${process.env.NODE_ENV === "development" ? `[${location}] ` : ""}${message}`;
};
var formatErrorString_default = formatErrorString;
export {
  formatErrorString_default as default
};
