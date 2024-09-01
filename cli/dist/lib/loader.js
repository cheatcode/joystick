import r from"chalk";class s{constructor(t={}){this.message=t.default_message}print(t="",e=!1){t&&(this.message=t),process.stdout.write(`${r[e?"redBright":"yellowBright"](">")} ${this.message}
`)}error(t=""){this.print(t,!0)}}var a=s;export{a as default};
//# sourceMappingURL=loader.js.map
