var g=(e=[],t=[])=>{let r=[],i=Math.max(e.length,t.length);for(let n=0;n<i;n+=1){let o=e[n],s=t[n];r.push([o,s])}return r},m=g;var c=(e="",t={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${t.message||t.reason||t}`)};var l=e=>{try{return typeof e=="string"}catch(t){c("types.isString",t)}};var u=(e="")=>{try{return document.createElement("div").setAttribute(e,"Test"),!0}catch{return!1}};var A=(e={})=>{try{let t=document.createElement(e.tagName),r=Object.entries(e.attributes);for(let i=0;i<r.length;i+=1){let[n,o]=r[i];u(n)&&t.setAttribute(n,o)}for(let i=0;i<e?.children?.length;i+=1){let n=e?.children[i];if(n){let o=y(n);t.appendChild(o)}}return t}catch(t){c("component.virtualDOM.renderTreeToDOM.renderElement",t)}},y=(e=null)=>{try{return l(e)?document.createTextNode(e):A(e)}catch(t){c("component.virtualDOM.renderTreeToDOM",t)}},f=y;var F=(e={},t={})=>{let r=[];for(let[i,n]of Object.entries(t))r.push(o=>(o&&o.setAttribute&&u(i)&&o.setAttribute(i,n),o));for(let i in e)i in t||r.push(n=>(n&&n.removeAttribute&&n.removeAttribute(i),n));return i=>{for(let n of r)n&&typeof n=="function"&&n(i)}},p=F;var d={select:(e,t)=>r=>{let i=r.value;r.replaceChildren(),p(e.attributes,t.attributes)(r),a([],t.children)(r);let n=r.querySelector(`option[value="${i}"]`);if(n&&(r.value=i),!n){let o=r.querySelector("option");r.value=o?.value||""}return r}};var h=(e,t)=>r=>{let i=e?f(e):null;return r&&r.replaceWith(i),i},T=()=>e=>{e&&e.remove()},C=(e=void 0,t=void 0)=>e===void 0||t===void 0?T():typeof e=="string"||typeof t=="string"?h(t,e):e.tagName!==t.tagName?h(t):t.tagName==="select"?d.select(e,t):["pre","code"].includes(t.tagName)?h(t,e):n=>(p(e.attributes,t.attributes)(n),a(e.children,t.children)(n),n),b=C;var E=(e=[],t)=>{e.forEach(r=>{r&&typeof r=="function"&&r(t)})},O=(e=[])=>{e.forEach(([t,r])=>{t&&typeof t=="function"&&t(r)})},P=(e=[],t=[])=>{let r=[];return t.slice(e.length).forEach(n=>{let o=s=>{let x=f(n);return s.appendChild(x),s};r.push(o)}),r},M=(e=[],t=[])=>{let r=[];return e.forEach((i,n)=>{let o=b(i,t[n]);r.push(o)}),r},j=(e=[],t=[])=>{let r=M(e,t),i=P(e,t);return n=>{if(n){let o=m(r,n.childNodes);O(o),E(i,n)}return n}},a=j;export{a as default};
