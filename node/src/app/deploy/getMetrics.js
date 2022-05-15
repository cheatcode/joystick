import { execSync } from 'child_process';
import { fileURLToPath } from "url";
import { dirname } from "path";

export default () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  console.log({
    __filename,
    __dirname,
  });
  return execSync(`chmod +x ${__dirname}/snapshot-metrics && ./${__dirname}/snapshot-metrics`);
};
