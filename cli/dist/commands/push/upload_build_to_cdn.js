import n from"node-fetch";import i from"form-data";import d from"fs";import m from"lodash";import c from"./cdn_mirrors.js";const{readFile:l}=d.promises,p=async()=>{const a=(await Promise.allSettled(c?.map(async t=>{const o=new AbortController;setTimeout(()=>o.abort(),2e3);const e=await n(`${t}/api/ping`,{signal:o.signal}).catch(r=>({status:503}));return{mirror:t,status:e.status}})))?.map(t=>t.value);return m.orderBy(a,["status","mirror"])[0]},u=async(a="",t={},o="")=>{const e=await p(),r=new i;return r.append("version_tar",await l(".build/build.encrypted.tar.gz"),`${a}.tar.gz`),r.append("build_timestamp",a),r.append("domain",t?.domain),r.append("deployment_id",t?._id),n(`${e?.mirror}/api/versions`,{method:"POST",headers:{...r.getHeaders(),"x-push-session-token":o},body:r}).then(async s=>(await s.json())?.data).catch(s=>{console.warn(s)})};var y=u;export{y as default};
