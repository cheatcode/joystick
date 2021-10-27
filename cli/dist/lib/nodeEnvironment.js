const nodeEnvironment = process && process.NODE_ENV;
const isDevelopment = nodeEnvironment === "development";
const isProduction = nodeEnvironment === "production";
var nodeEnvironment_default = nodeEnvironment;
export {
  nodeEnvironment_default as default,
  isDevelopment,
  isProduction
};
