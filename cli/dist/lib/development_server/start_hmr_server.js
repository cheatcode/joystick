import t from"child_process";import o from"path";const c=(e=[],r="")=>t.fork(o.resolve(`${r}/hmr_server.js`),[],{execArgv:e,silent:!0}),n=(e=0)=>{const r=["--no-warnings"];return e<19&&r.push("--experimental-specifier-resolution=node"),r},_=(e=0,r="")=>{const s=n(e);return c(s,r)};var a=_;export{a as default};
//# sourceMappingURL=start_hmr_server.js.map
