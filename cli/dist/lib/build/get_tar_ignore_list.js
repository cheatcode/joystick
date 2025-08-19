import"fs";import o from"./master_ignore_list.js";const n=(r=[])=>`{${[...(r||[])?.map(t=>`^${t}`),...(o||[])?.map(t=>`^${t}`),"*.tar","*.tar.gz","*.tar.xz"].filter((t,e,i)=>i.indexOf(t)===e)?.map(t=>`"${t}"`).join(",")}}`;var m=n;export{m as default};
//# sourceMappingURL=get_tar_ignore_list.js.map
