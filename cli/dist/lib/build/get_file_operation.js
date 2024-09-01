import s from"./copy_paths.js";const r=(t="")=>s.some(e=>e.regex.test(t)),c=(t="")=>t==="js",_=(t="")=>{const e=t?.split(".")?.pop(),i=c(e),o=r(t);return!i||i&&o?"copy_file":"build_file"};var p=_;export{p as default};
//# sourceMappingURL=get_file_operation.js.map
