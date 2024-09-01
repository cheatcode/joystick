import f from"fs";import r from"esbuild";import a from"../path_exists.js";const{readFile:s,writeFile:m}=f.promises,n=async(i="")=>{if(await a(i)){const o=await s(i,"utf-8"),t=await r.transform(o,{minify:!0}).catch(e=>{console.warn(e)});t?.code&&await m(i,t.code)}};var w=n;export{w as default};
//# sourceMappingURL=minify_file.js.map
