import{createClient as m}from"redis";import r from"chalk";const p=o=>new Promise(c=>setTimeout(c,o)),h=async(o={},c=2610)=>{const s=o?.connection||{host:"127.0.0.1",port:c,database:0},t={socket:{host:s?.host||"127.0.0.1",port:s?.port||c},database:s?.database||0,...o?.options||{}};o?.password&&(t.password=o.password),o?.username&&(t.username=o.username);const i=30,a=1e3;for(let n=1;n<=i;n++)try{const e=m(t);return e.on("error",l=>{n===i&&console.warn(r.yellowBright(`
Redis connection error: ${r.redBright(l?.message)}`))}),await e.connect(),Promise.resolve(e)}catch(e){if(n===i)throw console.warn(r.yellowBright(`
Failed to connect to Redis after ${i} attempts. Please double-check connection settings and try again.

Error from Redis:

${r.redBright(e?.message)}`)),e;n===1&&console.log(r.yellowBright(`
Waiting for Redis to be available on ${t.socket.host}:${t.socket.port}...`)),await p(a)}};var f=h;export{f as default};
