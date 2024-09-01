const c=(r={})=>Object.entries(r).reduce((u,[t,l])=>{if(l&&l.flags){const a=Object.values(l.flags);for(let s=0;s<a?.length;s+=1){const e=a[s];e&&e.value&&(u[t]=e.value&&![`${e.value}`.substring(0,1)].includes("-")?e.value:null)}}return u},{});var f=c;export{f as default};
//# sourceMappingURL=parse_options.js.map
