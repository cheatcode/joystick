import { execSync } from 'child_process';
import { fileURLToPath } from "url";
import { dirname } from "path";

export default () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // NOTE: Use __dirname so that we get the absolute path to this file from within the @joystick.js/node package.
  // Hardcode path for second command as it needs to be run relatively to the app process which is in the
  // /root/.deployments/<date> folder (execSync is in that folder when it tries to run).
  return execSync(`chmod +x ${__dirname}/snapshot-metrics && ./node_modules/@joystick.js/node/dist/app/deploy/snapshot-metrics`);
};
