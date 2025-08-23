import l from"fs";import o from"../get_files_in_path.js";import n from"./master_ignore_list.js";const c=async(s=[],i=[])=>(await o("./",[])).filter(e=>!i.some(t=>e.includes(t))).filter(e=>!s.some(t=>e.includes(t))).filter(e=>!n.some(t=>e.includes(t))).filter(e=>!l.lstatSync(e).isDirectory());var a=c;export{a as default};
//# sourceMappingURL=get_files_to_build.js.map
