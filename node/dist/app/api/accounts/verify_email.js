import r from"../../accounts/index.js";const a=async(e={},t={})=>{await r.verify_email({token:e?.query?.token}),t.redirect("/")};var o=a;export{o as default};
