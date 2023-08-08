import getPlatformSafePath from "../getPlatformSafePath.js";

export default  [
  getPlatformSafePath("email/"),
  getPlatformSafePath("lib/"),
  getPlatformSafePath("lib/browser"),
  getPlatformSafePath("ui/"),
  "index.client.js",
];
