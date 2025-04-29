import r from"chalk";import l from"fs";import{MongoClient as a}from"mongodb";import p from"mongo-uri-tool";import d from"./build_connection_string.js";const u=async(n={},c=2610)=>{try{const o=n?.connection||{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",replicaSet:`joystick_${c}`},e=d(o),s=p.parseUri(e),i=e.startsWith("mongodb+srv://"),t={maxIdleTimeMS:15e3,ssl:!["development","test"].includes(process.env.NODE_ENV),maxPoolSize:500,minPoolSize:50,serverSelectionTimeoutMS:6e4,waitQueueTimeoutMS:1e4,...process.env.NODE_ENV==="development"?{directConnection:!i&&o?.hosts?.length===1,minHeartbeatFrequencyMS:2e3,writeConcern:{w:1}}:{writeConcern:{w:"majority"}},...n?.options||{}};i&&(t.tls=!0),n?.options?.ca&&(t.ca=l.readFileSync(n?.options?.ca));const m=(await a.connect(e,t)).db(s.db);return Promise.resolve(m)}catch(o){console.warn(o),console.warn(r.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${r.redBright(o?.message)}`))}};var y=u;export{y as default};
