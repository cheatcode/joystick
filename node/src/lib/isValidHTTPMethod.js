import supportedHTTPMethods from "./supportedHTTPMethods";

export default (method = '') => {
  return supportedHTTPMethods.includes(method);
};