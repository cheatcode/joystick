import e from"chalk";import n from"./log_bars.js";const t=(g="",l={})=>{const d={info:"blue",success:"green",warning:"yellowBright",danger:"red"},r={info:"\u2771 Info",success:"\u2771 Ok",warning:"\u2771 Warning",danger:"\u2771 Error"},a=l.level?d[l.level]:"gray",$=l.level?r[l.level]:"Log",s=l.docs||"https://docs.cheatcode.co/joystick";if(console.log(`
${l.padding||""}${n()}
`),console.log(`${l.padding||""}${e[a](`${$}:`)}
`),console.log(`${l.padding||""}${e.white(g)}
`),console.log(`${l.padding||""}${e.grey("---")}
`),console.log(`${l.padding||""}${e.white("Relevant Documentation:")}
`),console.log(`${l.padding||""}${e.blue(s)}
`),console.log(`${l.padding||""}${e.white("Stuck? Ask a Question:")}
`),console.log(`${l.padding||""}${e.blue("http://discord.cheatcode.co")}
`),l.tools&&Array.isArray(l.tools)){console.log(`${l.padding||""}${e.white("Helpful Tools:")}
`);for(let o=0;o<l?.tools?.length;o+=1){const c=l?.tools[o];console.log(`${l.padding||""}${e.blue(`${c.title} \u2014 ${c.url}`)}
`)}}console.log(`${l.padding||""}${n()}
`)};var h=t;export{h as default};
//# sourceMappingURL=cli_log.js.map
