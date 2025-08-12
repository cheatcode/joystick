const k=e=>`\x1B[32m${e}\x1B[0m`,f=e=>`\x1B[31m${e}\x1B[0m`,$=e=>`\x1B[90m${e}\x1B[0m`,v=e=>{const n=e.match(/^ok\s+\d+\s+(.*)$/);if(n)return{status:"ok",title:n[1].trim().replace(/^- /,"")};const o=e.match(/^not ok\s+\d+\s+(.*)$/);return o?{status:"not_ok",title:o[1].trim().replace(/^- /,"")}:null},F=e=>{process.stdout.write(`${k("\u2714")} ${e}
`)},h=(e,n)=>{process.stdout.write(`
${f("---")}
`),process.stdout.write(`
${f("\u2716")} ${e}

`),process.stdout.write(`${f("Error:")}

`),n&&n.trim()?process.stdout.write(`  ${n.trim()}

`):process.stdout.write(`  (no stack trace)

`),process.stdout.write(`${f("---")}

`)},b=e=>e.match(/^ */)?.[0].length??0,d=(e,n,o)=>{const s=[],c=o+2;for(let l=n+1;l<e.length;l+=1){const a=e[l];if(a.trim()==="..."||b(a)<c)break;s.push(a.slice(c))}return s.join(`
`)},m=(e,n,o=0)=>{for(let s=o;s<e.length;s+=1){const c=e[s].match(/^(\s*)([A-Za-z0-9_-]+)\s*:\s*(\|>?-?)?\s*(.*)$/);if(!c)continue;const[,l,a,i,t]=c;if(a!==n)continue;const r=l.length;return i?{idx:s,type:"block",indent_len:r}:t&&t.trim()?{idx:s,type:"inline",value:t.trim(),indent_len:r}:{idx:s,type:"block",indent_len:r}}return null},g=e=>{const n=e.map(i=>i.replace(/\r$/,"")),o=m(n,"error",0);if(o){const i=o.indent_len+2;for(let t=o.idx+1;t<n.length;t+=1){const r=n[t];if(r.trim()==="..."||b(r)<i)break;const u=r.match(/^(\s*)(stack)\s*:\s*(\|>?-?)?\s*(.*)$/);if(u){const[,y,,w,p]=u,_=y.length;return w?d(n,t,_):p&&p.trim()?p.trim():d(n,t,_)}}}const s=m(n,"stack",0);if(s)return s.type==="inline"?s.value:d(n,s.idx,s.indent_len);const c=[];let l=!1;for(let i=0;i<n.length;i+=1){const t=n[i];if(/^\s*at\s+.+\:\d+\:\d+\)?$/.test(t)){l=!0,c.push(t.trim());continue}if(l)if(/^\s*at\s+/.test(t))c.push(t.trim());else break}if(c.length)return c.join(`
`);const a=m(n,"message",0);return a?a.type==="inline"?a.value:d(n,a.idx,a.indent_len):""},j=process.hrtime.bigint(),x=async()=>{let e="",n=0,o=0,s=null,c=!1,l=[];const a=i=>{const t=i.replace(/\r$/,"");if(!t)return;if(c){if(t.trim()==="..."){const u=g(l);h(s?.title||"(unknown)",u),o+=1,s=null,c=!1,l=[];return}l.push(t);return}if(/^\s*---\s*$/.test(t)&&s){c=!0,l=[];return}const r=v(t);if(r){r.status==="ok"?(n+=1,F(r.title)):r.status==="not_ok"&&(s={title:r.title});return}};process.stdin.setEncoding("utf8"),process.stdin.on("data",i=>{e+=i;const t=e.split(`
`);e=t.pop()||"";for(const r of t)a(r)}),process.stdin.on("end",()=>{if(s){const u=g(l);h(s.title,u),o+=1,s=null}const i=process.hrtime.bigint(),t=Number(i-j)/1e6,r=t<1e3?`${t.toFixed(0)} ms`:t<6e4?`${(t/1e3).toFixed(2)} s`:`${Math.floor(t/6e4)}m ${(t%6e4/1e3).toFixed(2)}s`;process.stdout.write(`
${$("===")}

${k("Passed:")} ${n}
${f("Failed:")} ${o}
${$("Duration:")} ${r}
`)})};var E=x;import.meta.url===`file://${process.argv[1]}`&&x();export{E as default};
//# sourceMappingURL=tap_reporter.js.map
