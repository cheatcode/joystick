import r from"chalk";import l from"fs";import{MongoClient as m}from"mongodb";import p from"mongo-uri-tool";import a from"./build_connection_string.js";const d=async(o={},c=2610)=>{try{const n=o?.connection||{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",replicaSet:`joystick_${c}`},t=a(n),i=p.parseUri(t),e={maxIdleTimeMS:15e3,tls:!["development","test"].includes(process.env.NODE_ENV),...o?.options||{}};o?.options?.ca&&(e.ca=l.readFileSync(o?.options?.ca));const s=(await m.connect(t,e)).db(i.db);return Promise.resolve(s)}catch(n){console.warn(n),console.warn(r.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${r.redBright(n?.message)}`))}};var w=d;export{w as default};
