import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
var getMetrics_default = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return execSync(`chmod +x ${__dirname}/snapshot-metrics && .${__dirname}/snapshot-metrics`);
};
export {
  getMetrics_default as default
};
