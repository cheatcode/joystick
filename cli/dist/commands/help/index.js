import r from"chalk";import{createRequire as n}from"module";import t from"../index.js";import s from"../../lib/rainbow_road.js";const p=n(import.meta.url),i=p("../../../package.json"),b=(o=5,e="")=>[...o-e.length>0?Array(o-e.length):""].map(()=>" ").join(""),l=(o={})=>Object.keys(o).map(e=>`<${e}>`).join(" "),m=(o={})=>Object.entries(o).map(([e,a])=>`  ${a.flags&&Object.keys(a.flags).map(c=>r.magenta(c))?.reverse().join(", ")}  ${r.gray(a.description)}`).join(`
`),$=()=>{console.log(`
  ${s()}
  
  ${r.yellowBright("@joystick.js/cli")} ${r.magenta(`(v${i.version})`)}
  
  ${r.blue("Manage your Joystick app.")}
  
  ${r.gray("https://docs.cheatcode.co/joystick/cli")}
  
  ${s()}

  ${Object.entries(t).map(([o,e])=>`
  ${r.green(o)}  ${r.gray(e.description)}

  joystick ${o} ${r.yellow(l(e.args))}
${e.options&&Object.keys(e.options).length>0?`
${m(e.options)}
`:""}`).join("")}`)};var k=$;export{k as default};
//# sourceMappingURL=index.js.map
