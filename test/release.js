import { execSync } from "child_process";
import semver from "semver";
import { createRequire } from "module";
import fs from 'fs';

const require = createRequire(import.meta.url);
const packageJSON = require("./package.json");
const canaryJSON = require('./canary.json');

const updatePackageJSONVersion = (packageJSON, originalVersion) => {
  packageJSON.version = originalVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
};

const updatePackageJSONDependencies = (packageJSON, canaryJSON) => {
  packageJSON.dependencies = canaryJSON?.dependencies;
  packageJSON.devDependencies = canaryJSON?.devDependencies;
  fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
};

updatePackageJSONDependencies(packageJSON, canaryJSON);

const originalVersion = `${packageJSON.version}`;

const version = semver.inc(packageJSON.version,
                           "prerelease",
                           "beta"
                           );

try {
  execSync(
    `npm version ${version} --allow-same-version && npm publish --access public`
    );
} catch (exception) {
  updatePackageJSONVersion(originalVersion, version);
}

if (process.env.NODE_ENV === 'production') {
  execSync(`git add . && git commit -m "release @joystick.js/test@${version}"`);
}