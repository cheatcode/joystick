import t from"child_process";import c from"util";const s=c.promisify(t.exec),n=(e="")=>{const r=process.platform==="win32"?"where":"whereis";return s(`${r} ${e}`).then(()=>!0).catch(o=>(console.warn(o),!1))};var a=n;export{a as default};
//# sourceMappingURL=command_exists.js.map
