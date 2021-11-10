import { execSync } from "child_process";
import semver from "semver";
import { createRequire } from "module";
import fs from 'fs';

const setPackageJSONVersions = (originalVersion, version) => {
  packageJSON.version = originalVersion;
  packageJSON.developmentVersion = version;
  console.log({ originalVersion, version });
  fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
};

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

try {
  execSync(
    `npm version ${version} --allow-same-version ${registry} && npm publish --access public ${force} ${registry}`
  );
} catch (exception) {
  setPackageJSONVersions(originalVersion, version);
}

if (process.env.NODE_ENV === 'production') {
  execSync(`git add . && git commit -m "release @joystick.js/ui@${version}" && git push origin master`);
}

if (process.env.NODE_ENV === 'development') {
  setPackageJSONVersions(originalVersion, version);
}