import o from"cluster";import c from"os";const i=(n=null)=>{const t=c.cpus().length;if(o.isPrimary){for(let s=0;s<t;s++){const r=o.fork();r.on("message",e=>{process.send&&process.send(e)}),process.on("message",e=>{r.send(e)})}o.on("exit",s=>{console.warn(`Worker ${s.process.pid} died.`)})}else n()};var d=i;export{d as default};
