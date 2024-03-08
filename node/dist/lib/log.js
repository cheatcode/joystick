import o from"chalk";import n from"./rainbow_road.js";const i=(c="",l={})=>{const s={info:"blue",success:"green",warning:"yellowBright",danger:"red"},r={info:"\u2771 Info",success:"\u2771 Ok",warning:"\u2771 Warning",danger:"\u2771 Error"},t=l.level?s[l.level]:"gray",g=l.level?r[l.level]:"Log",a=l.docs||"https://github.com/cheatcode/joystick";console.log(`
${n()}
`),console.log(`${o[t](`${g}:`)}
`),console.log(`${o.white(c)}
`),console.log(`${o.grey("---")}
`),console.log(`${o.white("Relevant Documentation:")}`),console.log(`
${o.blue(a)}
`),console.log(`${o.white("Stuck? Ask a Question:")}
`),console.log(`${o.blue("http://discord.cheatcode.co")}
`),l.tools&&Array.isArray(l.tools)&&(console.log(`${o.white("Helpful Tools:")}
`),l.tools.forEach(e=>{console.log(`${o.blue(`${e.title} \u2014 ${e.url}`)}
`)})),console.log(`${n()}
`)};var h=i;export{h as default};
