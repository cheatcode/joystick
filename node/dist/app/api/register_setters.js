import c from"./format_api_error.js";import f from"./get_api_context.js";import l from"./get_api_url_component.js";import y from"./handle_api_error.js";import g from"./set.js";import h from"../../lib/types.js";import w from"./validate_session.js";const x=(a={},n=[],p={},_={})=>{for(let o=0;o<n?.length;o+=1){const[r,i]=n[o];a.post(`/api/_setters/${l(r)}`,...h.is_array(i?.middleware)?i?.middleware:[],async(s={},t={})=>{if(process.databases?._sessions&&!await w(s,t))return t.status(403).send(JSON.stringify({errors:[c(new Error("Unauthorized request."))]}));const m=await f(s,t,p),u=s?.body?.input||null,d=s?.body?.output||null;g({set_name:r,set_options:{input:u,output:d},setter_definition:i,request_context:m,api_schema_options:_}).then(e=>t.status(200).send(JSON.stringify(e))).catch(e=>{y(`api.setters.${r}`,e,t)})})}};var z=x;export{z as default};
