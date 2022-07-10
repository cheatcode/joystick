var s=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var y=t=>{try{return typeof t=="function"}catch(e){s("types.isFunction",e)}};var a=t=>{try{return typeof t=="string"}catch(e){s("types.isString",e)}};var m=(t={},e={})=>{try{return t&&a(t)?t:t&&y(t)?t(e):""}catch(r){s("component.css.compile",r)}};var x=(t="")=>{try{let e=document.implementation.createHTMLDocument(""),r=document.createElement("style");return r.textContent=t,e.body.appendChild(r),r.sheet.cssRules}catch(e){s("component.css.prefix.getCSSRules",e)}},c=(t="",e="")=>{try{let r=x(t);return Object.entries(r).map(([o,p])=>p).map(o=>{if(o.constructor.name==="CSSStyleRule")return`[js-c="${e}"] ${o.cssText}`;if(o.constructor.name==="CSSMediaRule")return`
          @media ${o.conditionText} {
            ${Object.entries(o.cssRules).map(([p,u])=>`[js-c="${e}"] ${u.cssText}`).join(`
`)}
          }
        `}).join(`
`)}catch(r){s("component.css.prefix",r)}};var k=(t={})=>{try{let e=t?.options?.css,r=m(e,t),n=btoa(`${r.trim()}`).substring(0,8),i=document.head.querySelector(`style[js-c="${t.id}"]`);if(!i){let o=document.createElement("style");o.setAttribute("js-c",t?.id),o.setAttribute("js-css",n),o.innerHTML=c(r,t?.id),document.head.appendChild(o)}i&&n!==i.getAttribute("js-css")&&(i.innerHTML=c(r,t?.id))}catch(e){s("component.css.appendToHead",e)}};export{k as default};
