import l from"chalk";import s from"../constants.js";import c from"./get_code_frame.js";import t from"../rainbow_road.js";const n=(o="")=>o.replace(s.OBJECT_REGEX,""),i=(o={})=>{const e=o?.snippet?.split(`
`);console.log(`
`),console.log(`${t()}
`),o.file&&console.log(l.yellowBright(`Build Error in ${o?.file}:
`)),e&&e.length>0&&e.forEach(r=>r.includes(`> ${o.line} |`)?console.log(`   ${l.red(r)}`):console.log(`   ${l.gray(r)}`)),o?.stack&&(console.log(l.magentaBright(`
Stack Trace:
`)),console.log(l.yellow(`   ${n(o?.stack)}
`))),process.loader.error("Build error. Fix the error above to continue building your app."),console.log(`
`),console.log(`${t()}
`)},a=async(o={},e="")=>e&&e==="BUILD_ERROR"?{file:o?.file,snippet:o?.snippet?await c(o.file,{line:o?.line,column:o?.column}):"",stack:o?.stack,line:o?.line,character:o?.column,message:o?.message}:null,f=async o=>{const e=await a(o,"BUILD_ERROR");return e&&i(e),e};var d=f;export{d as default};
//# sourceMappingURL=on_warn.js.map
