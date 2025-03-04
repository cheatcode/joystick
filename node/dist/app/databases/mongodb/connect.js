import r from"chalk";import m from"fs";import{MongoClient as a}from"mongodb";import p from"mongo-uri-tool";import d from"./build_connection_string.js";const u=async(o={},c=2610)=>{try{const n=o?.connection||{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",replicaSet:`joystick_${c}`},e=d(n),i=p.parseUri(e),s=e.startsWith("mongodb+srv://"),t={maxIdleTimeMS:15e3,ssl:!["development","test"].includes(process.env.NODE_ENV),maxPoolSize:100,serverSelectionTimeoutMS:3e4,heartbeatFrequencyMS:1e4,...process.env.NODE_ENV==="development"?{directConnection:!0,minHeartbeatFrequencyMS:2e3,writeConcern:{w:1}}:{},...o?.options||{}};s&&(t.tls=!0),o?.options?.ca&&(t.ca=m.readFileSync(o?.options?.ca));const l=(await a.connect(e,t)).db(i.db);return Promise.resolve(l)}catch(n){console.warn(n),console.warn(r.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${r.redBright(n?.message)}`))}};var M=u;export{M as default};
