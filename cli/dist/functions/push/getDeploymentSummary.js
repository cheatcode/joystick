import fetch from "node-fetch";
import domains from "../../lib/domains.js";
import checkIfValidJSON from "../../lib/checkIfValidJSON.js";
import CLILog from "../../lib/CLILog.js";
var getDeploymentSummary_default = (answers = {}, loginSessionToken = "", deploymentDomain = "") => {
  return fetch(`${domains.provision}/api/deployments/summary`, {
    method: "POST",
    headers: {
      "x-login-session-token": loginSessionToken,
      "x-deployment-domain": deploymentDomain,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      provider: answers?.provider,
      sizes: [
        { type: "loadBalancers", quantity: answers?.loadBalancerInstances, id: answers?.loadBalancer_size },
        { type: "instances", quantity: answers?.appInstances, id: answers?.app_size }
      ]
    })
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (data?.error) {
      CLILog(data.error?.message, {
        level: "danger",
        docs: "https://cheatcode.co/docs/push"
      });
      process.exit(0);
    }
    return data?.data?.summary;
  });
};
export {
  getDeploymentSummary_default as default
};
