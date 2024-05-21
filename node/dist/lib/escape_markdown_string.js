import n from"./escape_html.js";const s=(r="")=>{const o=/(```[\s\S]*?```)/g;let e=r.split(o);for(let t=0;t<e.length;t++)e[t].match(o)||(e[t]=n(e[t]));return e.join("")};var l=s;export{l as default};
