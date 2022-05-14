import { execSync } from 'child_process';

export default () => {
  return execSync(`chmod +x ./snapshot-metrics && ./snapshot-metrics`);
};