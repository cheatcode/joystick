const { execSync } = require("child_process");
const semver = require("semver");
const packageJSON = require("./package.json");

const version = semver.inc(packageJSON.version, "prerelease", "beta");
const force = process.env.NODE_ENV === "development" ? "--force" : "";
const registry =
  process.env.NODE_ENV === "development"
    ? "--registry http://localhost:4873"
    : "";

execSync(
  `npm version ${version} --allow-same-version ${registry} && npm publish ${force} ${registry}`
);
