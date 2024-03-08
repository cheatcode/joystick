import"./get_platform_safe_path.js";const e=async(t="")=>(await(process.platform==="win32"?import(`file://${t}`):import(t)))?.default;var f=e;export{f as default};
