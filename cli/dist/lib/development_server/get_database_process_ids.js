const r=()=>{const t=[],o=Object.entries(process._databases||{});for(let s=0;s<o?.length;s+=1){const[d,e]=o[s];if(e?.pid&&t.push(e.pid),!e?.pid){const c=Object.entries(e);for(let n=0;n<c?.length;n+=1){const[p,i]=c[n];i?.pid&&t.push(i.pid)}}}return t};var a=r;export{a as default};
//# sourceMappingURL=get_database_process_ids.js.map
