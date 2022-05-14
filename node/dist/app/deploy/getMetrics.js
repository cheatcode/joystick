import { execSync } from "child_process";
var getMetrics_default = () => {
  return execSync(`chmod +x ./snapshot-metrics && ./snapshot-metrics`);
};
export {
  getMetrics_default as default
};
