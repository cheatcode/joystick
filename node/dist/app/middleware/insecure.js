import t from"./generate_insecure_page.js";const n=(e,r,s)=>{if(!e.secure)return r.send(t(e?.headers?.host,e?.url));s()};var a=n;export{a as default};
