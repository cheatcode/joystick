import getPlatformSafePath from "../getPlatformSafePath.js";
var nodePaths_default = [
  getPlatformSafePath("api/"),
  getPlatformSafePath("routes/"),
  getPlatformSafePath("fixtures/"),
  getPlatformSafePath("lib/node"),
  getPlatformSafePath("tests/"),
  "index.server.js"
];
export {
  nodePaths_default as default
};
