import r from"chalk";import l from"fs";import{MongoClient as m}from"mongodb";import p from"mongo-uri-tool";import a from"./build_connection_string.js";const d=async(o={},t=2610)=>{try{const n=o?.connection||{hosts:[{hostname:"127.0.0.1",port:t}],database:"app",replicaSet:`joystick_${t}`},c=a(n),i=p.parseUri(c),e={maxIdleTimeMS:15e3,ssl:!["development","test"].includes(process.env.NODE_ENV),...o?.options||{}};o?.options?.ca&&(e.ca=l.readFileSync(o?.options?.ca)),console.log({connection_string:c,connection_options:e});const s=(await m.connect(c,e)).db(i.db);return Promise.resolve(s)}catch(n){console.warn(n),console.warn(r.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${r.redBright(n?.message)}`))}};var w=d;export{w as default};
