var o=(t="",r={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${r.message||r.reason||r}`)};var u=(t="{}")=>{try{return JSON.parse(t)}catch(r){o("parseJSON",r)}};var c=(t="",r=[])=>{try{console.error(`${t} failed with the following errors:`),r.forEach(e=>{console.log(e.message),e.stack&&console.log(e.stack)})}catch(e){o(t,e)}};var p=async(t={})=>{try{let r=await t.text();return u(r)}catch(r){o("accounts.request.handleParseResponse",r)}},w=(t="GET",r={})=>{try{return["POST"].includes(t)?JSON.stringify({...r,origin:window?.location?.origin}):null}catch(e){o("accounts.request.getBody",e)}},m=(t=null)=>{try{switch(t){case"authenticated":case"user":return"GET";default:return"POST"}}catch(r){o("accounts.request.getHTTPMethod",r)}},h=(t="",r={})=>{try{if(typeof window.fetch!="undefined")return new Promise((e,n)=>{let d=`${window.location.origin}/api/_accounts/${t}`,i=m(t),l=w(i,r);return fetch(d,{method:i,mode:"cors",headers:{"Content-Type":"application/json"},body:l,credentials:"include"}).then(async s=>{let a=await p(s);return a?.errors?(c(`accounts.${t}`,a.errors),n(a)):e(a)}).catch(s=>(c(`accounts.${t}`,[s]),n({errors:[s]})))})}catch(e){o(`accounts.request.${t}`,e)}};var $=async(t={})=>{try{let r=await h("authenticated",t);return r?.status===200&&r?.authenticated}catch(r){o("accounts.authenticated",r)}};export{$ as default};
