var o=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var u=(r="{}")=>{try{return JSON.parse(r)}catch(e){o("parseJSON",e)}};var n=(r="",e=[])=>{try{console.error(`${r} failed with the following errors:`),e.forEach(t=>{console.log(t.message),t.stack&&console.log(t.stack)})}catch(t){o(r,t)}};var l=async(r={})=>{try{let e=await r.text();return u(e)}catch(e){o("accounts.request.handleParseResponse",e)}},p=(r="GET",e={})=>{try{return["POST"].includes(r)?JSON.stringify({...e,origin:window?.location?.origin}):null}catch(t){o("accounts.request.getBody",t)}},w=(r=null)=>{try{switch(r){case"authenticated":case"user":return"GET";default:return"POST"}}catch(e){o("accounts.request.getHTTPMethod",e)}},F=(r="",e={})=>{try{if(typeof window.fetch!="undefined")return new Promise((t,a)=>{let h=`${window.location.origin}/api/_accounts/${r}`,i=w(r),d=p(i,e);return fetch(h,{method:i,mode:"cors",headers:{"Content-Type":"application/json"},body:d,credentials:"include"}).then(async s=>{let c=await l(s);return c?.errors?(n(`accounts.${r}`,c.errors),a(c)):t(c)}).catch(s=>(n(`accounts.${r}`,[s]),a({errors:[s]})))})}catch(t){o(`accounts.request.${r}`,t)}};export{F as default};
