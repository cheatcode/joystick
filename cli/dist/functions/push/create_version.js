import fetch from "node-fetch";
var create_version_default = (options = {}) => {
  return fetch(`${options?.push_provision_domain}/api/versions/${options?.domain}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-push-session-token": options?.session_token
    },
    body: JSON.stringify(options?.body)
  })?.then(async (response) => {
    const data = await response.json();
    return data?.data;
  }).catch((error) => {
    console.warn(error);
  });
};
export {
  create_version_default as default
};
