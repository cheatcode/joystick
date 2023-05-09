var o=(e="",r={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${r.message||r.reason||r}`)};var f=()=>typeof window=="undefined";var c=(e="",r=[])=>{try{console.error(`${e} failed with the following errors:`),r.forEach(t=>{console.log(t.message),t.stack&&console.log(t.stack)})}catch(t){o(e,t)}};var u=(e="{}")=>{try{return JSON.parse(e)}catch(r){o("parseJSON",r)}};var k=async(e={})=>{try{let r=await e.text();return u(r)}catch(r){o("api.get.handleParseResponse",r)}},m=(e="",r={})=>{try{return typeof window.fetch!="undefined"&&!r?.skip?new Promise((t,i)=>{let s=r.input?JSON.stringify(r.input):null,d=r.output?JSON.stringify(r.output):null,a=`${window.location.origin}/api/_getters/${e}?input=${s}&output=${d}`;return fetch(a,{method:"GET",mode:"cors",headers:{...r?.headers||{}},credentials:"include"}).then(async n=>{let p=await k(n);return p?.errors?(c("get request",p.errors),i(p)):t(p)}).catch(n=>(c("get request",[n]),i({errors:[n]})))}):Promise.resolve()}catch(t){o("get request",t)}};var _=async(e={})=>{try{let r=await e.text();return u(r)}catch(r){o("api.set.handleParseResponse",r)}},E=(e={})=>{try{return JSON.stringify(e)}catch(r){o("api.set.getBody",r)}},w=(e="",r={})=>{try{return typeof window.fetch!="undefined"?new Promise((t,i)=>{let s=`${window.location.origin}/api/_setters/${e}`,d=E(r);return fetch(s,{method:"POST",mode:"cors",headers:{...r?.headers||{},"Content-Type":"application/json"},body:d,credentials:"include"}).then(async a=>{let n=await _(a);return n?.errors?(c("set request",n.errors),i(n)):t(n)}).catch(a=>(c("set request",[a]),i({errors:[a]})))}):Promise.resolve()}catch(t){o("set request",t)}};var y={get:m,set:w};var l=e=>{try{return typeof e=="function"}catch(r){o("types.isFunction",r)}};var h=async(e={},r={},t={},i={})=>{try{if(i?.options?.data&&l(i.options.data)){let s=await i.options.data(e,r,t,i);return Promise.resolve(s)}return Promise.resolve()}catch(s){o("component.data.fetch",s)}};var x=(e={},r={},t={})=>{try{return{...e,refetch:async(i={})=>{let s=await h(y,r,i,t);return t.data=x(s,r,t),window.__joystick_data__[t?.id]=s,t.render({afterRefetchDataRender:()=>{t?.lifecycle?.onRefetchData&&t?.lifecycle?.onRefetchData(t)}}),s}}}catch(i){o("component.data.compile",i)}},F=x;var or=(e={})=>{try{if(!f()&&window.__joystick_data__&&window.__joystick_data__[e?.id]){let r=window.__joystick_data__[e?.id]||{},t=window.__joystick_req__||{};return F(r,t,e)}return e?.data||{}}catch(r){o("component.loadDataFromWindow",r)}};export{or as default};
