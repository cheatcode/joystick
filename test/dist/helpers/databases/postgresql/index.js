import l from"pg";import n from"chalk";import h from"os";const{Pool:i}=l;var u=async(r={},c=2610)=>{const o=r?.connection||{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",username:(h.userInfo()||{}).username||"",password:""};try{const e=o.hosts&&o.hosts[0],a=new i({user:o?.username||"",database:o?.database,password:o?.password||"",host:e?.hostname,port:e?.port,...r?.options||{}});return{pool:a,query:(...t)=>a.query(...t).then(s=>s?.rows||[]).catch(s=>{throw console.log(n.redBright(`
Failed SQL Statement:
`)),console.log(t[0]),console.log(`
`),console.log(n.redBright(`
Failed Values:
`)),console.log(t[1]),s})}}catch(e){console.warn(n.yellowBright(`
Failed to connect to PostgreSQL. Please double-check connection settings and try again.

Error from PostgreSQL:

${n.redBright(e?.message)}`))}};export{u as default};
