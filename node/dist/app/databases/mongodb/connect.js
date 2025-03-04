import r from"chalk";import l from"fs";import{MongoClient as a}from"mongodb";import p from"mongo-uri-tool";import d from"./build_connection_string.js";const u=async(o={},c=2610)=>{try{const n=o?.connection||{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",replicaSet:`joystick_${c}`},e=d(n),s=p.parseUri(e),i=e.startsWith("mongodb+srv://"),t={maxIdleTimeMS:15e3,ssl:!["development","test"].includes(process.env.NODE_ENV),maxPoolSize:500,minPoolSize:50,serverSelectionTimeoutMS:6e4,waitQueueTimeoutMS:1e4,...process.env.NODE_ENV==="development"?{directConnection:!i,minHeartbeatFrequencyMS:2e3,writeConcern:{w:1}}:{writeConcern:{w:"majority"}},...o?.options||{}};i&&(t.tls=!0),o?.options?.ca&&(t.ca=l.readFileSync(o?.options?.ca));const m=(await a.connect(e,t)).db(s.db);return Promise.resolve(m)}catch(n){console.warn(n),console.warn(r.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${r.redBright(n?.message)}`))}};var y=u;export{y as default};
