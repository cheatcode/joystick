import i from"node-fetch";import e from"./get.js";import n from"./set.js";const r={get:(o="",t={})=>(global.window={},window.fetch=i,window.location={origin:`http://localhost:${process.env.PORT}`},e(o,t)),set:(o="",t={})=>(global.window={},window.fetch=i,window.location={origin:`http://localhost:${process.env.PORT}`},n(o,t))};var p=r;export{p as default};
