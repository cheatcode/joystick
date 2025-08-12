import b from"child_process";import j from"../cli_log.js";import"chalk";const y=(t="")=>{if(t?.includes("Using configuration"))return null;if(t?.includes("No tests found"))return j("No tests found. Add tests in the /tests folder at the root of your Joystick app.",{level:"danger",docs:"https://cheatcode.co/docs/joystick/test/setup"});console.log(t)},F=(t="")=>{if(t?.includes("Using configuration"))return null;if(t?.includes("No tests found in")){const[o]=t?.split(",");return console.log(`${o}
`)}console.log(t)},N=(t={},o={})=>{t.stdout.on("data",function(r){const l=r.toString();F(l,o)}),t.stderr.on("data",function(r){const l=r.toString();y(l,o)})},S=(t={})=>{const o=`${process.cwd()}/node_modules/.bin/ava`;return new Promise((r,l)=>{const c=b.spawn(o,["--config",`${t?.__dirname}/ava_config.js`,"--tap"],{env:{...process.env,databases:process.databases,FORCE_COLOR:"1"}});let a="",_=0,p=0,i=null,u=!1,f=[];const v=process.hrtime.bigint(),g=s=>`\x1B[32m${s}\x1B[0m`,m=s=>`\x1B[31m${s}\x1B[0m`,$=s=>`\x1B[90m${s}\x1B[0m`,x=s=>{const e=s.match(/^ok\s+\d+\s+(.*)$/);if(e)return{status:"ok",title:e[1].trim().replace(/^- /,"")};const n=s.match(/^not ok\s+\d+\s+(.*)$/);return n?{status:"not_ok",title:n[1].trim().replace(/^- /,"")}:null},k=s=>{process.stdout.write(`${g("\u2714")} ${s}
`)},h=(s,e)=>{process.stdout.write(`
${m("-!-")}
`),process.stdout.write(`
${m("\u2716")} ${s}

`),process.stdout.write(`${m("Error:")}

`),e&&e.trim()?process.stdout.write(`  ${e.trim()}

`):process.stdout.write(`  (no stack trace)

`),process.stdout.write(`${m("-!-")}

`)},w=s=>{const e=s.replace(/\r$/,"");if(!e)return;if(u){if(e.trim()==="..."){h(i?.title||"(unknown)",f.join(`
`)),p+=1,i=null,u=!1,f=[];return}f.push(e);return}if(/^\s*---\s*$/.test(e)&&i){u=!0,f=[];return}const n=x(e);if(n){n.status==="ok"?(_+=1,k(n.title)):n.status==="not_ok"&&(i={title:n.title});return}};c.stdout.on("data",s=>{a+=s.toString();const e=a.split(`
`);a=e.pop()||"";for(const n of e)w(n)}),c.stderr.on("data",s=>{s.toString().includes("Using configuration")||process.stderr.write(s)}),c.on("exit",(s,e)=>{a.trim()&&w(a),i&&(h(i.title,f.join(`
`)),p+=1);const n=process.hrtime.bigint(),d=Number(n-v)/1e6,O=d<1e3?`${d.toFixed(0)} ms`:d<6e4?`${(d/1e3).toFixed(2)} s`:`${Math.floor(d/6e4)}m ${(d%6e4/1e3).toFixed(2)}s`;process.stdout.write(`
${$("===")}

${g("Passed:")} ${_}
${m("Failed:")} ${p}
${$("Duration:")} ${O}

`),r()}),c.on("error",s=>{console.error("Test runner error:",s.message),r()})})},C=(t={})=>{const o=`${process.cwd()}/node_modules/.bin/ava`,r=`${t?.__dirname}/tap_reporter.js`;return new Promise(l=>{const c=`DEBUG=ava:watcher && ${o} --config ${t?.__dirname}/ava_config.js`,a=t?.watch?"--watch":"",_=t?.watch?"":`--tap | node ${r}`,p=`${c} ${a} ${_}`,i=b.exec(p,{stdio:"inherit",env:{...process.env,databases:process.databases,FORCE_COLOR:"1"}},u=>{u?(t.cleanup_process.send(JSON.stringify({process_ids:t?.process_ids})),process.exit(0)):(t.cleanup_process.send(JSON.stringify({process_ids:t?.process_ids})),process.exit(0))});N(i,t)})};var P=C;export{P as default,S as run_tests_integrated};
//# sourceMappingURL=run_tests.js.map
