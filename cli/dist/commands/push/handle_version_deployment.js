import t from"node-fetch";const a=async(e={})=>t(`${e?.push_provision_domain}/api/deployments/${e?.deployment?.domain}`,{method:"PUT",headers:{"x-push-session-token":e?.session_token,"Content-Type":"application/json"},body:JSON.stringify({build_timestamp:e?.build_timestamp,domain:e?.deployment?.domain,deployment_id:e?.deployment?._id})}).then(async n=>(await n.json())?.data).catch(n=>{console.warn(n)});var i=a;export{i as default};
