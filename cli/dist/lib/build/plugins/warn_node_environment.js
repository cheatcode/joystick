import t from"fs";import r from"chalk";const{readFile:a}=t.promises,s=(o={})=>{o.onLoad({filter:/\.js$/},async(n={})=>{try{(await a(n.path,"utf-8"))?.match(/process.env.NODE_ENV\s+=\s/gi)?.length&&console.warn(r.yellowBright(`
[WARNING] process.env.NODE_ENV should only be set via a CLI flag in development or via external environment variables in production.
`))}catch(e){console.warn(e)}})};var l=s;export{l as default};
