var g=(e=[],t=[])=>{let r=[],o=Math.max(e.length,t.length);for(let n=0;n<o;n+=1){let c=e[n],s=t[n];r.push([c,s])}return r},h=g;var i=(e="",t={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${t.message||t.reason||t}`)};var a=e=>{try{return typeof e=="string"}catch(t){i("types.isString",t)}};var b=(e={})=>{try{let t=document.createElement(e.tagName),r=Object.entries(e.attributes);for(let o=0;o<r.length;o+=1){let[n,c]=r[o];t.setAttribute(n,c)}for(let o=0;o<e?.children?.length;o+=1){let n=e?.children[o];if(n){let c=m(n);t.appendChild(c)}}return t}catch(t){i("component.virtualDOM.renderTreeToDOM.renderElement",t)}},m=(e=null)=>{try{return a(e)?document.createTextNode(e):b(e)}catch(t){i("component.virtualDOM.renderTreeToDOM",t)}},f=m;var F=(e={},t={})=>{let r=[];for(let[o,n]of Object.entries(t))r.push(c=>(c&&c.setAttribute&&c.setAttribute(o,n),c));for(let o in e)o in t||r.push(n=>(n&&n.removeAttribute&&n.removeAttribute(o),n));return o=>{for(let n of r)n&&typeof n=="function"&&n(o)}},p=F;var l={select:(e,t)=>r=>{let o=r.value;r.replaceChildren(),p(e.attributes,t.attributes)(r),u([],t.children)(r);let n=r.querySelector(`option[value="${o}"]`);if(n&&(r.value=o),!n){let c=r.querySelector("option");r.value=c?.value||""}return r}};var y=(e,t)=>r=>{let o=e?f(e):null;return r&&r.replaceWith(o),o},T=()=>e=>{e&&e.remove()},A=(e=void 0,t=void 0)=>e===void 0||t===void 0?T():typeof e=="string"||typeof t=="string"?y(t,e):e.tagName!==t.tagName?y(t):t.tagName==="select"?l.select(e,t):n=>(p(e.attributes,t.attributes)(n),u(e.children,t.children)(n),n),d=A;var C=(e=[],t)=>{e.forEach(r=>{r&&typeof r=="function"&&r(t)})},E=(e=[])=>{e.forEach(([t,r])=>{t&&typeof t=="function"&&t(r)})},O=(e=[],t=[])=>{let r=[];return t.slice(e.length).forEach(n=>{let c=s=>{let x=f(n);return s.appendChild(x),s};r.push(c)}),r},P=(e=[],t=[])=>{let r=[];return e.forEach((o,n)=>{let c=d(o,t[n]);r.push(c)}),r},M=(e=[],t=[])=>{let r=P(e,t),o=O(e,t);return n=>{if(n){let c=h(r,n.childNodes);E(c),C(o,n)}return n}},u=M;export{u as default};
