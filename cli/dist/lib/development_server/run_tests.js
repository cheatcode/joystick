import v from"child_process";import F from"../cli_log.js";import"chalk";const N=(t="")=>{if(t?.includes("Using configuration"))return null;if(t?.includes("No tests found"))return F("No tests found. Add tests in the /tests folder at the root of your Joystick app.",{level:"danger",docs:"https://cheatcode.co/docs/joystick/test/setup"});console.log(t)},S=(t="")=>{if(t?.includes("Using configuration"))return null;if(t?.includes("No tests found in")){const[o]=t?.split(",");return console.log(`${o}
`)}console.log(t)},C=(t={},o={})=>{t.stdout.on("data",function(r){const l=r.toString();S(l,o)}),t.stderr.on("data",function(r){const l=r.toString();N(l,o)})},R=(t={})=>{const o=`${process.cwd()}/node_modules/.bin/ava`;return new Promise((r,l)=>{const m=process.exit,_=process.listeners("exit");process.exit=s=>{},process.removeAllListeners("exit");const c=v.spawn(o,["--config",`${t?.__dirname}/ava_config.js`,"--tap"],{env:{...process.env,databases:process.databases,FORCE_COLOR:"1"}});let i="",g=0,p=0,a=null,$=!1,u=[];const k=process.hrtime.bigint(),h=s=>`\x1B[32m${s}\x1B[0m`,f=s=>`\x1B[31m${s}\x1B[0m`,x=s=>`\x1B[90m${s}\x1B[0m`,O=s=>{const e=s.match(/^ok\s+\d+\s+(.*)$/);if(e)return{status:"ok",title:e[1].trim().replace(/^- /,"")};const n=s.match(/^not ok\s+\d+\s+(.*)$/);return n?{status:"not_ok",title:n[1].trim().replace(/^- /,"")}:null},j=s=>{process.stdout.write(`${h("\u2714")} ${s}
`)},w=(s,e)=>{process.stdout.write(`
${f("-!-")}
`),process.stdout.write(`
${f("\u2716")} ${s}

`),process.stdout.write(`${f("Error:")}

`),e&&e.trim()?process.stdout.write(`  ${e.trim()}

`):process.stdout.write(`  (no stack trace)

`),process.stdout.write(`${f("-!-")}

`)},b=s=>{const e=s.replace(/\r$/,"");if(!e)return;if($){if(e.trim()==="..."){w(a?.title||"(unknown)",u.join(`
`)),p+=1,a=null,$=!1,u=[];return}u.push(e);return}if(/^\s*---\s*$/.test(e)&&a){$=!0,u=[];return}const n=O(e);if(n){n.status==="ok"?(g+=1,j(n.title)):n.status==="not_ok"&&(a={title:n.title});return}};c.stdout.on("data",s=>{i+=s.toString();const e=i.split(`
`);i=e.pop()||"";for(const n of e)b(n)}),c.stderr.on("data",s=>{s.toString().includes("Using configuration")||process.stderr.write(s)}),c.on("exit",(s,e)=>{process.exit=m,_.forEach(E=>process.on("exit",E)),i.trim()&&b(i),a&&(w(a.title,u.join(`
`)),p+=1);const n=process.hrtime.bigint(),d=Number(n-k)/1e6,y=d<1e3?`${d.toFixed(0)} ms`:d<6e4?`${(d/1e3).toFixed(2)} s`:`${Math.floor(d/6e4)}m ${(d%6e4/1e3).toFixed(2)}s`;process.stdout.write(`
${x("===")}

${h("Passed:")} ${g}
${f("Failed:")} ${p}
${x("Duration:")} ${y}

`),r()}),c.on("error",s=>{process.exit=m,_.forEach(e=>process.on("exit",e)),console.error("Test runner error:",s.message),r()})})},U=(t={})=>{const o=`${process.cwd()}/node_modules/.bin/ava`,r=`${t?.__dirname}/tap_reporter.js`;return new Promise(l=>{const m=`DEBUG=ava:watcher && ${o} --config ${t?.__dirname}/ava_config.js`,_=t?.watch?"--watch":"",c=t?.watch?"":`--tap | node ${r}`,i=`${m} ${_} ${c}`,g=v.exec(i,{stdio:"inherit",env:{...process.env,databases:process.databases,FORCE_COLOR:"1"}},p=>{p?(t.cleanup_process.send(JSON.stringify({process_ids:t?.process_ids})),process.exit(0)):(t.cleanup_process.send(JSON.stringify({process_ids:t?.process_ids})),process.exit(0))});C(g,t)})};var D=U;export{D as default,R as run_tests_integrated};
//# sourceMappingURL=run_tests.js.map
