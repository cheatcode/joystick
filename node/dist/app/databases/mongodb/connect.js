import s from"chalk";import"fs";import{MongoClient as m}from"mongodb";import a from"mongo-uri-tool";import p from"./build_connection_string.js";const d=async(t={},i=2610)=>{try{const o=t?.connection||{hosts:[{hostname:"127.0.0.1",port:i}],database:"app",replicaSet:`joystick_${i}`},n=p(o),c=a.parseUri(n),r=n.startsWith("mongodb+srv://"),e={maxIdleTimeMS:15e3,tls:!["development","test"].includes(process.env.NODE_ENV),maxPoolSize:500,minPoolSize:50,serverSelectionTimeoutMS:6e4,waitQueueTimeoutMS:1e4,...process.env.NODE_ENV==="development"?{directConnection:!r&&o?.hosts?.length===1,minHeartbeatFrequencyMS:2e3,writeConcern:{w:1}}:{writeConcern:{w:"majority"}},...t?.options||{}};r&&(e.tls=!0),mongodb_options?.tlsCAFile&&(e.tlsCAFile=mongodb_options?.tlsCAFile),mongodb_options?.tlsCertificateKeyFile&&(e.tlsCertificateKeyFile=mongodb_options?.tlsCertificateKeyFile);const l=(await m.connect(n,e)).db(c.db);return Promise.resolve(l)}catch(o){console.warn(o),console.warn(s.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${s.redBright(o?.message)}`))}};var C=d;export{C as default};
