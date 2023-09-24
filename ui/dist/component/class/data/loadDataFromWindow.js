var o=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var w=()=>typeof window=="undefined";var c=(t="",e=[])=>{try{console.error(`${t} failed with the following errors:`),e.forEach(r=>{console.log(r.message),r.stack&&console.log(r.stack)})}catch(r){o(t,r)}};var l=(t="{}")=>{try{return JSON.parse(t)}catch{return t}};var y=(t={})=>Object.entries(t).map(([e,r])=>`${e}=${r}`)?.join("; ");var S=async(t={})=>{try{let e=await t.text();return l(e)}catch(e){o("api.get.handleParseResponse",e)}},_=(t="",e={})=>{try{return typeof window.fetch!="undefined"&&!e?.skip?new Promise((r,i)=>{let a=e.input?JSON.stringify(e.input):null,f=e.output?JSON.stringify(e.output):null,p=`${window.location.origin}/api/_getters/${t}?input=${a}&output=${f}`,d=document.querySelector('[name="csrf"]')?.getAttribute("content"),s={...e?.headers||{},"x-joystick-csrf":d};return window?.__joystick_test__&&(s.Cookie=y({joystickLoginToken:window.__joystick_test_login_token__,joystickLoginTokenExpiresAt:window.__joystick_test_login_token_expires_at__})),e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${t}_loading`]:!0}),fetch(p,{method:"GET",mode:"cors",headers:s,credentials:"include"}).then(async n=>{let u=await S(n);return e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${t}_loading`]:!1}),u?.errors?(c("get request",u.errors),i(u)):r(u)}).catch(n=>(c("get request",[n]),e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${t}_loading`]:!1}),i({errors:[n]})))}):Promise.resolve()}catch(r){o("get request",r)}};var q=async(t={})=>{try{let e=await t.text();return l(e)}catch(e){o("api.set.handleParseResponse",e)}},R=(t={})=>{try{let e={...t};return e?.loader&&delete e.loader,JSON.stringify(e)}catch(e){o("api.set.getBody",e)}},m=(t="",e={})=>{try{return typeof window.fetch!="undefined"?new Promise((r,i)=>{let a=`${window.location.origin}/api/_setters/${t}`,f=R(e),p=document.querySelector('[name="csrf"]')?.getAttribute("content"),d={...e?.headers||{},"Content-Type":"application/json","x-joystick-csrf":p};return window?.__joystick_test__&&(d.Cookie=generateCookieHeader({joystickLoginToken:window?.__joystick_test_login_token__,joystickLoginTokenExpiresAt:window.__joystick_test_login_token_expirs_at__})),e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${t}_loading`]:!0}),fetch(a,{method:"POST",mode:"cors",headers:d,body:f,credentials:"include"}).then(async s=>{let n=await q(s);return e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${t}_loading`]:!1}),n?.errors?(c("set request",n.errors),i(n)):r(n)}).catch(s=>(c("set request",[s]),e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${t}_loading`]:!1}),i({errors:[s]})))}):Promise.resolve()}catch(r){o("set request",r)}};var h={get:_,set:m};var x=t=>{try{return typeof t=="function"}catch(e){o("types.isFunction",e)}};var k=async(t={},e={},r={},i={})=>{try{if(i?.options?.data&&x(i.options.data)){let a=await i.options.data(t,e,r,i);return Promise.resolve(a)}return Promise.resolve()}catch(a){o("component.data.fetch",a)}};var g=(t="",e=[])=>{typeof window!="undefined"&&!!window.__joystick_test__&&(window.test={...window.test||{},functionCalls:{...window?.test?.functionCalls||{},[t]:[...window?.test?.functionCalls&&window?.test?.functionCalls[t]||[],{calledAt:new Date().toISOString(),args:e}]}})};var F="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890".split(""),j=(t=16)=>{let e="",r=0;for(;r<t;)e+=F[Math.floor(Math.random()*(F.length-1))],r+=1;return e};var b=(t={},e={},r={})=>{try{return{...t,refetch:async(i={})=>{g(`ui.${r?.options?.test?.name||j()}.data.refetch`,[i]);let a=await k(h,e,i,r);return r.data=b(a,e,r),window.__joystick_data__[r?.id]&&(window.__joystick_data__[r?.id]=a),window?.__joystick_test__||r.render({afterRefetchDataRender:()=>{r?.lifecycle?.onRefetchData&&r?.lifecycle?.onRefetchData(r)}}),r.data}}}catch(i){o("component.data.compile",i)}},E=b;var we=(t={})=>{try{if(!w()){let e=window.__joystick_data__&&window.__joystick_data__[t?.id]||{},r=window.__joystick_req__||{};return E(e,r,t)}return t?.data||{}}catch(e){o("component.loadDataFromWindow",e)}};export{we as default};
