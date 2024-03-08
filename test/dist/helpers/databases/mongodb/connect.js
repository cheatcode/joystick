import{MongoClient as l}from"mongodb";import r from"chalk";import p from"mongo-uri-tool";import m from"fs";import a from"./build_connection_string.js";const d=async(o={},c=2610)=>{try{const n=o?.connection||{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",replicaSet:`joystick_${c}`},t=a(n),i=p.parseUri(t),e={ssl:!["development","test"].includes(process.env.NODE_ENV),...o?.options||{}};o?.options?.ca&&(e.ca=m.readFileSync(o?.options?.ca));const s=new l(t,e).db(i.db);return Promise.resolve(s)}catch(n){console.warn(r.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${r.redBright(n?.message)}`))}};var B=d;export{B as default};
