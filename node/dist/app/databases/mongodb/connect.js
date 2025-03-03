import r from"chalk";import l from"fs";import{MongoClient as m}from"mongodb";import a from"mongo-uri-tool";import p from"./build_connection_string.js";const d=async(o={},e=2610)=>{try{const n=o?.connection||{hosts:[{hostname:"127.0.0.1",port:e}],database:"app",replicaSet:`joystick_${e}`},t=p(n),i=a.parseUri(t),c={maxIdleTimeMS:15e3,ssl:!["development","test"].includes(process.env.NODE_ENV),maxPoolSize:100,serverSelectionTimeoutMS:3e4,heartbeatFrequencyMS:1e4,...process.env.NODE_ENV==="development"?{directConnection:!0,minHeartbeatFrequencyMS:2e3,writeConcern:{w:1}}:{},...o?.options||{}};o?.options?.ca&&(c.ca=l.readFileSync(o?.options?.ca));const s=(await m.connect(t,c)).db(i.db);return Promise.resolve(s)}catch(n){console.warn(n),console.warn(r.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${r.redBright(n?.message)}`))}};var M=d;export{M as default};
