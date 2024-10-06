import n from"node-fetch";const a=(e={})=>n(`${e?.push_domain}/api/deployments/${e?.domain}`,{method:"GET",headers:{"x-push-deployment-token":e?.deployment_token,Accept:"application/json"}})?.then(async t=>await t.json()).catch(t=>{console.warn(t)});var c=a;export{c as default};
//# sourceMappingURL=get_deployment.js.map
