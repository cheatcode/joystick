const n=(e,r="")=>{if(!r)return e;if(!e)return;const t=r.split(".");return n(e[t.shift()],t.join("."))};var i=n;export{i as default};
