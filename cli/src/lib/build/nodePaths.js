import getPlatformSafePath from "../getPlatformSafePath.js";

export default [
  getPlatformSafePath("api/"),
  getPlatformSafePath("routes/"),
  getPlatformSafePath("fixtures/"),
  getPlatformSafePath("lib/node"),
  getPlatformSafePath("tests/"),
  "index.server.js",
];
