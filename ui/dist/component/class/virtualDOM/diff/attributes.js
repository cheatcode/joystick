var f=(i="")=>{try{return document.createElement("div").setAttribute(i,"Test"),!0}catch{return!1}};var a=(i={},u={})=>{let s=[];for(let[e,t]of Object.entries(u))s.push(r=>(r&&r.setAttribute&&f(e)&&r.setAttribute(e,t),r));for(let e in i)e in u||s.push(t=>(t&&t.removeAttribute&&t.removeAttribute(e),t));return e=>{for(let t of s)t&&typeof t=="function"&&t(e)}},n=a;export{n as default};
