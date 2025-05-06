import c from"chalk";import"fs";import{MongoClient as m}from"mongodb";import p from"mongo-uri-tool";import a from"./build_connection_string.js";const f=async(o={},i=2610)=>{try{const e=o?.connection||{hosts:[{hostname:"127.0.0.1",port:i}],database:"app",replicaSet:`joystick_${i}`},t=a(e),s=p.parseUri(t),r=t.startsWith("mongodb+srv://"),n={maxIdleTimeMS:15e3,tls:!["development","test"].includes(process.env.NODE_ENV),maxPoolSize:500,minPoolSize:50,serverSelectionTimeoutMS:6e4,waitQueueTimeoutMS:1e4,...process.env.NODE_ENV==="development"?{directConnection:!r&&e?.hosts?.length===1,minHeartbeatFrequencyMS:2e3,writeConcern:{w:1}}:{writeConcern:{w:"majority"}},...o?.options||{}};r&&(n.tls=!0),o?.options?.tlsCAFile&&(n.tlsCAFile=o?.options?.tlsCAFile),o?.options?.tlsCertificateKeyFile&&(n.tlsCertificateKeyFile=o?.options?.tlsCertificateKeyFile);const l=(await m.connect(t,n)).db(s.db);return Promise.resolve(l)}catch(e){console.warn(e),console.warn(c.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${c.redBright(e?.message)}`))}};var v=f;export{v as default};
