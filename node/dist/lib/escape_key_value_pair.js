import r from"./escape_html.js";const c=(e={})=>{const l=Object.entries(e||{});for(let t=0;t<l?.length;t+=1){const[o,s]=l[t];delete e[o],e[r(o)]=r(s)}return e};var p=c;export{p as default};
