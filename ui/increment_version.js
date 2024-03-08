import child_process from 'child_process';

child_process.execSync(`npm version prerelease --preid=canary`);
