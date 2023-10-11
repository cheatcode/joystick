import fetch from "node-fetch";
var validate_push_config_default = (options = {}) => {
  return fetch(`${options?.push_provision_domain}/api/validate/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(options?.push_config)
  })?.then(async (response) => {
    const data = await response.json();
    return data?.data;
  }).catch((error) => {
    console.warn(error);
  });
};
export {
  validate_push_config_default as default
};
