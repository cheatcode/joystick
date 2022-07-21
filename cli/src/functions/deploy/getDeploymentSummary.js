import fetch from "node-fetch";
import domains from "../../lib/domains.js";
import checkIfValidJSON from "../../lib/checkIfValidJSON.js";
import CLILog from "../../lib/CLILog.js";

export default (answers = {}, joystickDeployToken = '', machineFingerprint = {}) => {
  return fetch(`${domains.deploy}/api/cli/deployments/summary`, {
    method: 'POST',
    headers: {
      'x-joystick-deploy-token': joystickDeployToken,
      'x-joystick-deploy-machine-fingerprint': JSON.stringify(machineFingerprint),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      provider: answers?.provider,
      sizes: [
        { type: 'loadBalancers', quantity: answers?.loadBalancerInstances, id: answers?.loadBalancer_size },
        { type: 'instances', quantity: answers?.appInstances, id: answers?.instance_size }
      ],
    })
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);

    if (data?.error) {
      CLILog(
        data.error,
        {
          level: 'danger',
          docs: 'https://cheatcode.co/docs/deploy'
        }
      );
  
      process.exit(0);
    }

    if (data.error) {
      return console.log(chalk.redBright(data.error));
    }

    return data?.data;
  });
};