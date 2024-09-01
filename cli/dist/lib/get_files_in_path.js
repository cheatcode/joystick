import e from"fs";import{join as n}from"path";const{readdir:c,stat:f}=e.promises,s=async(i="./",r=[])=>{const o=(await c(i))?.map(t=>n(i,t));r.push(...o);for(let t=0;t<o?.length;t+=1){const a=o[t];(await f(a)).isDirectory()&&await s(a,r)}return r};var _=s;export{_ as default};
//# sourceMappingURL=get_files_in_path.js.map
