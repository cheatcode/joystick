import fetch from "node-fetch";

const handle_version_deployment = async (options = {}) => {
  return fetch(`${options?.push_provision_domain}/api/deployments/${options?.deployment?.domain}`, {
   method: "PUT",
   headers: {
     "x-push-session-token": options?.session_token,
     'Content-Type': 'application/json',
   },
   body: JSON.stringify({
     build_timestamp: options?.build_timestamp,
     domain: options?.deployment?.domain,
     deployment_id: options?.deployment?._id,
   }),
  }).then(async (response) => {
   const data = await response.json();
   return data?.data;
  }).catch((error) => {
    console.warn(error);
  });
};

export default handle_version_deployment;
