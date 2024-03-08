import n from"fs";import t from"chalk";const{readFile:r}=n.promises,a=(e={})=>{e.onLoad({filter:/\.js$/},async(o={})=>{(await r(o.path,"utf-8"))?.match(/process.env.NODE_ENV\s+=\s/gi)?.length&&console.warn(t.yellowBright(`
[WARNING] process.env.NODE_ENV should only be set via a CLI flag in development or via external environment variables in production.
`))})};var c=a;export{c as default};
