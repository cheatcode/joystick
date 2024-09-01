import r from"fs";import o from"./master_ignore_list.js";const s=(e=[])=>`{${[...((r.existsSync(".gitignore")?r.readFileSync(".gitignore","utf-8"):"")?.split(`
`)?.filter(t=>!t?.includes("#")&&t?.trim()!=="")||[])?.map(t=>`^${t}`),...(e||[])?.map(t=>`^${t}`),...(o||[])?.map(t=>`^${t}`),"*.tar","*.tar.gz","*.tar.xz"].filter((t,i,n)=>n.indexOf(t)===i)?.map(t=>`"${t}"`).join(",")}}`;var c=s;export{c as default};
//# sourceMappingURL=get_tar_ignore_list.js.map
