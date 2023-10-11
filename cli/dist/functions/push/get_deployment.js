import fetch from "node-fetch";
var get_deployment_default = (options = {}) => {
  return fetch(`${options?.push_provision_domain}/api/deployments/${options?.domain}`, {
    method: "GET",
    headers: {
      "x-push-session-token": options?.session_token,
      Accept: "application/json"
    }
  })?.then(async (response) => {
    const data = await response.json();
    return data?.data;
  }).catch((error) => {
    console.warn(error);
  });
};
export {
  get_deployment_default as default
};
