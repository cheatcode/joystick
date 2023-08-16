import l from"chalk";import o from"./rainbowRoad.js";var t=(c="",e={})=>{const g={info:"blue",success:"green",warning:"yellowBright",danger:"red"},d={info:"\u2771 Info",success:"\u2771 Ok",warning:"\u2771 Warning",danger:"\u2771 Error"},a=e.level?g[e.level]:"gray",r=e.level?d[e.level]:"Log",$=e.docs||"https://github.com/cheatcode/joystick";console.log(`
${e.padding||""}${o()}
`),console.log(`${e.padding||""}${l[a](`${r}:`)}
`),console.log(`${e.padding||""}${l.white(c)}
`),console.log(`${e.padding||""}${l.grey("---")}
`),console.log(`${e.padding||""}${l.white("Relevant Documentation:")}
`),console.log(`${e.padding||""}${l.blue($)}
`),console.log(`${e.padding||""}${l.white("Stuck? Ask a Question:")}
`),console.log(`${e.padding||""}${l.blue("https://github.com/cheatcode/joystick/discussions")}
`),e.tools&&Array.isArray(e.tools)&&(console.log(`${e.padding||""}${l.white("Helpful Tools:")}
`),e.tools.forEach(n=>{console.log(`${e.padding||""}${l.blue(`${n.title} \u2014 ${n.url}`)}
`)})),console.log(`${e.padding||""}${o()}
`)};export{t as default};
