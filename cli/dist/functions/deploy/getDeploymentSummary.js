import fetch from "node-fetch";
import domains from "./domains.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
import CLILog from "../../lib/CLILog.js";
var getDeploymentSummary_default = (answers = {}, deploymentToken = "", fingerprint = "") => {
  return fetch(`${domains.deploy}/api/deployments/summary`, {
    method: "POST",
    headers: {
      "x-deployment-token": deploymentToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...fingerprint,
      provider: answers?.provider,
      sizes: [
        { type: "loadBalancers", quantity: answers?.loadBalancerInstances, id: answers?.loadBalancer_size },
        { type: "instances", quantity: answers?.appInstances, id: answers?.instance_size }
      ]
    })
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (data?.error) {
      CLILog(data.error, {
        level: "danger",
        docs: "https://cheatcode.co/docs/deploy"
      });
      process.exit(0);
    }
    if (data.error) {
      return console.log(chalk.redBright(data.error));
    }
    return data;
  });
};
export {
  getDeploymentSummary_default as default
};
