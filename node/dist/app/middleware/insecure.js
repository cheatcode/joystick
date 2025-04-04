import s from"./generate_insecure_page.js";const i=(e,u,r)=>{if(e.url.includes("/_push"))return r();if(!e.secure)return u.send(s(e?.headers?.host,e?.url));r()};var t=i;export{t as default};
