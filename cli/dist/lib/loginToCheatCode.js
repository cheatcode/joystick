import fetch from "node-fetch";
import domains from "./domains.js";
var loginToCheatCode_default = (emailAddress = "", password = "") => {
  return fetch(`${domains.deploy}/api/cli/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      emailAddress,
      password
    })
  }).then(async (response) => {
    return response.text();
  });
};
export {
  loginToCheatCode_default as default
};
