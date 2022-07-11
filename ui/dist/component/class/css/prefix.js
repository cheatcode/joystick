var o=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var a=(r="")=>{try{let e=document.implementation.createHTMLDocument(""),t=document.createElement("style");return t.textContent=r,e.body.appendChild(t),t.sheet.cssRules}catch(e){o("component.css.prefix.getCSSRules",e)}},p=(r="",e="")=>{try{let t=a(r);return Object.entries(t).map(([s,n])=>n).map(s=>{if(s.constructor.name==="CSSStyleRule")return`[js-c="${e}"] ${s.cssText}`;if(s.constructor.name==="CSSMediaRule")return`
          @media ${s.conditionText} {
            ${Object.entries(s.cssRules).map(([n,c])=>`[js-c="${e}"] ${c.cssText}`).join(`
`)}
          }
        `}).join(`
`)}catch(t){o("component.css.prefix",t)}};export{p as default};
