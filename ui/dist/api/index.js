var o=(e="",r={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${r.message||r.reason||r}`)};var a=(e="",r=[])=>{try{console.error(`${e} failed with the following errors:`),r.forEach(t=>{console.log(t.message),t.stack&&console.log(t.stack)})}catch(t){o(e,t)}};var p=(e="{}")=>{try{return JSON.parse(e)}catch(r){o("parseJSON",r)}};var h=async(e={})=>{try{let r=await e.text();return p(r)}catch(r){o("api.get.handleParseResponse",r)}},m=(e="",r={})=>{try{if(typeof window.fetch!="undefined"&&!r?.skip)return new Promise((t,i)=>{let u=r.input?JSON.stringify(r.input):null,d=r.output?JSON.stringify(r.output):null,n=`${window.location.origin}/api/_getters/${e}?input=${u}&output=${d}`;return fetch(n,{method:"GET",mode:"cors",headers:{...r?.headers||{}},credentials:"include"}).then(async s=>{let c=await h(s);return c?.errors?(a("get request",c.errors),i(c)):t(c)}).catch(s=>(a("get request",[s]),i({errors:[s]})))})}catch(t){o("get request",t)}};var f=async(e={})=>{try{let r=await e.text();return p(r)}catch(r){o("api.set.handleParseResponse",r)}},w=(e={})=>{try{return JSON.stringify(e)}catch(r){o("api.set.getBody",r)}},l=(e="",r={})=>{try{if(typeof window.fetch!="undefined")return new Promise((t,i)=>{let u=`${window.location.origin}/api/_setters/${e}`,d=w(r);return fetch(u,{method:"POST",mode:"cors",headers:{...r?.headers||{},"Content-Type":"application/json"},body:d,credentials:"include"}).then(async n=>{let s=await f(n);return s?.errors?(a("set request",s.errors),i(s)):t(s)}).catch(n=>(a("set request",[n]),i({errors:[n]})))})}catch(t){o("set request",t)}};var T={get:m,set:l};export{T as default};
