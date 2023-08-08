import filesToCopy from "../filesToCopy.js";

export default [
  { path: "api" },
  { path: "email" },
  { path: "fixtures" },
  { path: "lib" },
  { path: "ui" },
  { path: "routes" },
  { path: "index.client.js" },
  { path: "index.server.js" },
  ...filesToCopy,
];