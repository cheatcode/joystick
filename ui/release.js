import { execSync } from "child_process";
import semver from "semver";
import { createRequire } from "module";
import fs from 'fs';

const require = createRequire(import.meta.url);
const packageJSON = require("./package.json");

const originalVersion = `${packageJSON.version}`;
const version = semver.inc(
  process.env.NODE_ENV === 'development' ? packageJSON.developmentVersion : packageJSON.version,
  "prerelease",
  "beta"
);
const force = process.env.NODE_ENV === "development" ? "--force" : "";
const registry =
  process.env.NODE_ENV === "development"
    ? "--registry http://localhost:4873"
    : "";

execSync(
  `npm version ${version} --allow-same-version ${registry} && npm publish --access public ${force} ${registry}`
);

if (process.env.NODE_ENV === 'production') {
  execSync(`git add . && git commit -m "release @joystick.js/ui@${version}"`);
}

if (process.env.NODE_ENV === 'development') {
  packageJSON.version = originalVersion;
  packageJSON.developmentVersion = version;
  console.log({ originalVersion, version });
  fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2))
}