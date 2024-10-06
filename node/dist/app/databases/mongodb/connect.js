import s from"chalk";import m from"fs";import{MongoClient as p}from"mongodb";import a from"mongo-uri-tool";import d from"./build_connection_string.js";const g=async(o={},c=2610)=>{try{const n=o?.connection||{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",replicaSet:`joystick_${c}`},e=d(n),l=a.parseUri(e),t={maxIdleTimeMS:15e3,ssl:!["development","test"].includes(process.env.NODE_ENV),...o?.options||{}};o?.options?.ca&&(t.ca=m.readFileSync(o?.options?.ca));const r=await p.connect(e,t),i=r.db(l.db);return console.log({client:r,db:i}),Promise.resolve(i)}catch(n){console.warn(n),console.warn(s.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${s.redBright(n?.message)}`))}};var w=g;export{w as default};
