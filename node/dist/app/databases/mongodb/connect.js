import c from"chalk";import s from"fs";import{MongoClient as p}from"mongodb";import a from"mongo-uri-tool";import d from"./build_connection_string.js";const f=async(o={},i=2610)=>{try{const e=o?.connection||{hosts:[{hostname:"127.0.0.1",port:i}],database:"app",replicaSet:`joystick_${i}`},t=d(e),l=a.parseUri(t),r=t.startsWith("mongodb+srv://"),n={maxIdleTimeMS:15e3,tls:!["development","test"].includes(process.env.NODE_ENV),maxPoolSize:500,minPoolSize:50,serverSelectionTimeoutMS:6e4,waitQueueTimeoutMS:1e4,...process.env.NODE_ENV==="development"?{directConnection:!r&&e?.hosts?.length===1,minHeartbeatFrequencyMS:2e3,writeConcern:{w:1}}:{writeConcern:{w:"majority"}},...o?.options||{}};r&&(n.tls=!0),o?.options?.tlsCAFile&&(n.tlsCAFile=s.readFileSync(o?.options?.tlsCAFile)),o?.options?.tlsCertificateKeyFile&&(n.tlsCertificateKeyFile=s.readFileSync(o?.options?.tlsCertificateKeyFile));const m=(await p.connect(t,n)).db(l.db);return Promise.resolve(m)}catch(e){console.warn(e),console.warn(c.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${c.redBright(e?.message)}`))}};var g=f;export{g as default};
