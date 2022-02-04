const site = {
  development: "http://localhost:2600",
  staging: "https://test.cheatcode.co",
  production: "https://cheatcode.co"
}[process.env.NODE_ENV || "development"];
const deploy = {
  development: "http://localhost:2603",
  staging: "https://deploy-test.cheatcode.co",
  production: "https://deploy.cheatcode.co"
}[process.env.NODE_ENV || "development"];
var domains_default = {
  site,
  deploy
};
export {
  domains_default as default
};
