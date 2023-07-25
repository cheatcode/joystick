import fs from 'fs';
import child_process from 'child_process';

fs.renameSync('package.json', '_package.json');
fs.renameSync('canary.json', 'package.json');

child_process.execSync('npm version prerelease --preid=canary');

child_process.execSync('npm publish --access=public');

fs.renameSync('package.json', 'canary.json');
fs.renameSync('_package.json', 'package.json');
