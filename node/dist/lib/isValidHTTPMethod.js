import supportedHTTPMethods from "./supportedHTTPMethods";
var isValidHTTPMethod_default = (method = "") => {
  return supportedHTTPMethods.includes(method);
};
export {
  isValidHTTPMethod_default as default
};
