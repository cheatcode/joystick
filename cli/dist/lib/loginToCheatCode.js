import fetch from "node-fetch";
import checkIfValidJSON from "./checkIfValidJSON.js";
import CLILog from "./CLILog.js";
import domains from "./domains.js";
var loginToCheatCode_default = (emailAddress = "", password = "") => {
  return fetch(`${domains.provision}/api/cli/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      emailAddress,
      password
    })
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (data?.error) {
      CLILog(
        data?.error?.message,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push/authentication"
        }
      );
      process.exit(0);
    }
    return data?.data?.token;
  });
};
export {
  loginToCheatCode_default as default
};
