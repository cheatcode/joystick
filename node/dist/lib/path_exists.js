import t from"fs";import r from"./get_platform_safe_path.js";const a=(s="")=>new Promise(e=>{t.access(r(s),t.constants.F_OK,o=>{e(!o)})});var p=a;export{p as default};
