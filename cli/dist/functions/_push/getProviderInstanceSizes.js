import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from "../../lib/checkIfValidJSON.js";
var getProviderInstanceSizes_default = (answers = {}, loginSessionToken = "") => {
  return fetch(
    `${domains.provision}/api/providers/${answers?.provider}/sizes`,
    {
      method: "GET",
      headers: {
        "x-login-session-token": loginSessionToken,
        "Content-Type": "application/json"
      }
    }
  ).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (data?.error) {
      CLILog(
        data.error?.message,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push/deployment-tokens"
        }
      );
      process.exit(0);
    }
    return data?.data;
  });
};
export {
  getProviderInstanceSizes_default as default
};
