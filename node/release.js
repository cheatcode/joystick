import { execSync } from "child_process";
import semver from "semver";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const packageJSON = require("./package.json");

const version = semver.inc(packageJSON.version, "prerelease", "beta");
const force = process.env.NODE_ENV === "development" ? "--force" : "";
const registry =
  process.env.NODE_ENV === "development"
    ? "--registry http://localhost:4873"
    : "";

execSync(
  `npm version ${version} --allow-same-version ${registry} && npm publish --access public ${force} ${registry}`
);
