import"../../lib/log_request_errors.js";import l from"../../lib/parse_json.js";import d from"../../lib/generate_cookie_header.js";const f=async(r={})=>{const e=await r.text();return l(e)},_=(r="",e={})=>typeof window.fetch<"u"&&!e?.skip?new Promise((o,a)=>{const i=e.input?JSON.stringify(e.input):null,c=e.output?JSON.stringify(e.output):null,u=`${window.location.origin}/api/_getters/${r}?input=${i}&output=${c}`,t={...e?.headers||{},"x-joystick-csrf":"joystick_test"};return e?.user&&(t.Cookie=d({joystick_login_token:e?.user?.joystick_login_token,joystick_login_token_expires_at:e?.user?.joystick_login_token_expires_at})),e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${r}_loading`]:!0}),fetch(u,{method:"GET",mode:"cors",headers:t,credentials:"include",cache:"no-store"}).then(async s=>{const n=await f(s);return e?.loader?.instance&&e?.loader?.instance?.setState({[e?.loader?.state||`${r}_loading`]:!1}),n?.errors?a(n):o(n)}).catch(s=>a({errors:[s]}))}):Promise.resolve();var p=_;export{p as default};
