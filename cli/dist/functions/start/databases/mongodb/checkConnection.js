"use strict";var e=require("mongodb");function o(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var t=o(require("chalk"));module.exports=async o=>{const s=((e={})=>{let o="mongodb://";return e&&(e.username||e.password)&&(o=`${o}${e.username||""}:${e.password||""}@`),e&&e.hosts&&Array.isArray(e.hosts)&&(o=`${o}${e.hosts.map((e=>`${e.hostname}:${e.port}`)).join(",")}`),e&&e.database&&(o=`${o}/${e.database}`),o})(o);try{return(await e.MongoClient.connect(s,{connectTimeoutMS:3e3,socketTimeoutMS:3e3,useNewUrlParser:!0,useUnifiedTopology:!0,ssl:!1})).close(),!0}catch(e){console.warn(t.default.yellowBright("\nFailed to connect to MongoDB. Please double-check connection settings and try again.")),process.exit(1)}};
