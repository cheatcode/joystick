import t from"./browser_path_exclusions.js";import s from"./browser_paths.js";import n from"./node_paths.js";const _=(r="")=>n.some(e=>r.includes(e)),c=(r="")=>s.some(e=>r.includes(e))&&!t.some(e=>r.includes(e)),i=(r="")=>{const e=c(r),o=_(r);if(e)return"browser";if(o)return"node"};var f=i;export{f as default};
//# sourceMappingURL=get_path_platform.js.map
