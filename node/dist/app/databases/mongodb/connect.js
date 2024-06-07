import i from"chalk";import l from"fs";import{MongoClient as p}from"mongodb";import m from"mongo-uri-tool";import a from"./build_connection_string.js";const d=async(n={},t=2610)=>{try{const o=n?.connection||{hosts:[{hostname:"127.0.0.1",port:t}],database:"app",replicaSet:`joystick_${t}`},c=a(o),e=m.parseUri(c);console.log({connection:o,connection_string:c,parsed_uri:e});const r={ssl:!["development","test"].includes(process.env.NODE_ENV),...n?.options||{}};n?.options?.ca&&(r.ca=l.readFileSync(n?.options?.ca));const s=(await p.connect(c,r)).db(e.db);return Promise.resolve(s)}catch(o){console.warn(o),console.warn(i.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${i.redBright(o?.message)}`))}};var w=d;export{w as default};
