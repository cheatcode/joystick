import { execSync } from 'child_process';
import { fileURLToPath } from "url";
import { dirname } from "path";

export default () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // NOTE: Use __dirname so that we get the path to this file from within the @joystick.js/node package and
  // note the default application root.
  return execSync(`chmod +x ${__dirname}/snapshot-metrics && .${__dirname}/snapshot-metrics`);
};
