import n from"chalk";import i from"fs";import g from"os";import d from"pg";import l from"../sql.js";const{Pool:m}=d,p=async(c={},h=2610)=>{const s=c?.connection||{hosts:[{hostname:"127.0.0.1",port:h}],database:"app",username:(g.userInfo()||{}).username||"",password:""};try{const a=s.hosts&&s.hosts[0],u={user:s?.username||"",database:s?.database,password:s?.password||"",host:a?.hostname,port:a?.port,...c?.options||{}};c?.options?.ssl?.ca&&(u.ssl={ca:i.readFileSync(c?.options?.ssl?.ca)});const r=new m(u);return{pool:r,query:(...t)=>r.query(...t).then(e=>e?.rows||[]).catch(e=>{throw console.log(n.redBright(`
Failed SQL Statement:
`)),console.log(t[0]),console.log(`
`),console.log(n.redBright(`
Failed Values:
`)),console.log(t[1]),e}),add_column:(t={})=>{const e=l.add_column(t);return r.query(e.statement).then(o=>o?.rows||[]).catch(o=>{throw console.log(n.redBright(`
Failed SQL Statement:
`)),console.log(e.statement),o})},create_table:(t={})=>{const e=l.create_table(t);return r.query(e.statement).then(o=>o?.rows||[]).catch(o=>{throw console.log(n.redBright(`
Failed SQL Statement:
`)),console.log(e.statement),o})},insert:(t={})=>{const e=l.insert(t);return r.query(e.statement,e.values).then(o=>o?.rows||[]).catch(o=>{throw console.log(n.redBright(`
Failed SQL Statement:
`)),console.log(e.statement),console.log(`
`),console.log(n.redBright(`
Failed Values:
`)),console.log(e.values),o})},select:(t={})=>{const e=l.select(t);return r.query(e.statement,e.values).then(o=>o?.rows||[]).catch(o=>{throw console.log(n.redBright(`
Failed SQL Statement:
`)),console.log(e.statement),console.log(`
`),console.log(n.redBright(`
Failed Values:
`)),console.log(e.where),o})},update:(t={})=>{const e=l.update(t);return r.query(e.statement,e.values).then(o=>o?.rows||[]).catch(o=>{throw console.log(n.redBright(`
Failed SQL Statement:
`)),console.log(e.statement),console.log(`
`),console.log(n.redBright(`
Failed Values:
`)),console.log(e.values),o})}}}catch(a){console.warn(n.yellowBright(`
Failed to connect to PostgreSQL. Please double-check connection settings and try again.

Error from PostgreSQL:

${n.redBright(a?.message)}`))}};var f=p;export{f as default};
