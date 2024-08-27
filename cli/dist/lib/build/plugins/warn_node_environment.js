import n from"fs";import t from"chalk";const{readFile:a}=n.promises,r=(e={})=>{e.onLoad({filter:/\.js$/},async(o={})=>{(await a(o.path,"utf-8"))?.match(/process.env.NODE_ENV\s+=\s/gi)?.length&&console.warn(t.yellowBright(`
[WARNING] process.env.NODE_ENV should only be set via a CLI flag in development or via external environment variables in production.
`))}).catch(o=>{console.log("WNE",o)})};var c=r;export{c as default};
