import{MongoClient as s}from"mongodb";import c from"chalk";import a from"mongo-uri-tool";import p from"fs";import l from"./buildConnectionString.js";var b=async(o={},e=2610)=>{const r=o?.connection||{hosts:[{hostname:"127.0.0.1",port:e}],database:"app",replicaSet:`joystick_${e}`},t=l(r),i=a.parseUri(t);try{const n={useNewUrlParser:!0,useUnifiedTopology:!0,ssl:!["development","test"].includes(process.env.NODE_ENV),...o?.options||{}};return o?.options?.ca&&(n.ca=p.readFileSync(o?.options?.ca)),(await s.connect(t,n)).db(i.db)}catch(n){console.warn(c.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.

Error from MongoDB:

${c.redBright(n?.message)}`))}};export{b as default};
