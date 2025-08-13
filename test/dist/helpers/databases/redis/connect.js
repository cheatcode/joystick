import{createClient as s}from"redis";import e from"chalk";const l=async(o={},t=2610)=>{try{const n=o?.connection||{host:"127.0.0.1",port:t,database:0},r={socket:{host:n?.host||"127.0.0.1",port:n?.port||t},database:n?.database||0,...o?.options||{}};o?.password&&(r.password=o.password),o?.username&&(r.username=o.username);const c=s(r);return c.on("error",i=>{console.warn(e.yellowBright(`
Redis connection error: ${e.redBright(i?.message)}`))}),await c.connect(),Promise.resolve(c)}catch(n){console.warn(e.yellowBright(`
Failed to connect to Redis. Please double-check connection settings and try again.

Error from Redis:

${e.redBright(n?.message)}`))}};var p=l;export{p as default};
