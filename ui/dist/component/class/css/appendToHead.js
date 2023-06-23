var p=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var l=t=>{try{return typeof t=="function"}catch(e){p("types.isFunction",e)}};var h=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){p("types.isObject",e)}};var u=t=>{try{return typeof t=="string"}catch(e){p("types.isString",e)}};var d=(t="",e={})=>{try{let r="";if(t&&u(t))return r=t,r;if(t&&l(t))return r=t(e),r;if(t&&h(t)){let o=t?.print&&(u(t?.print)||l(t?.print)),c=t?.min&&h(t?.min),m=t?.min?.width&&h(t?.min?.width),g=t?.min?.height&&h(t?.min?.height),x=t?.max&&h(t?.max),w=t?.max?.width&&h(t?.max?.width),S=t?.max?.height&&h(t?.max?.height);if(o&&(r+=`
          @media print {
            ${typeof t?.print=="function"?t?.print(e):t.print}
          }
        `),c&&m){let s=Object.entries(t?.min?.width);for(let i=0;i<s.length;i+=1){let[a,n]=s[i];r+=`
            @media screen and (min-width: ${a}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}if(c&&g){let s=Object.entries(t?.min?.height);for(let i=0;i<s.length;i+=1){let[a,n]=s[i];r+=`
            @media screen and (min-height: ${a}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}if(x&&w){let s=Object.entries(t?.max?.width);for(let i=0;i<s.length;i+=1){let[a,n]=s[i];r+=`
            @media screen and (max-width: ${a}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}if(x&&S){let s=Object.entries(t?.max?.height);for(let i=0;i<s.length;i+=1){let[a,n]=s[i];r+=`
            @media screen and (max-height: ${a}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}return r}return""}catch(r){p("component.css.compileCSS",r)}};var b=(t,e)=>{let r=new RegExp(/^(?!@).+({|,)/gim);return(e||"").replace(r,o=>["@",": "].some(c=>o?.includes(c))?o:`[js-c="${t}"] ${o.trim()}`)?.trim()},f=(t={},e=[])=>{if(t.instance&&t.instance.options&&t.instance.options.css){let r=t.instance.id,o=t.instance.options.css,c=d(o,t.instance),m=b(r,c);e.push(m)}if(t.children&&t.children.length>0){let r=t?.children?.length||0;for(;r--;)f(t.children[r],e)}return e},y=f;var L=(t=!1)=>{try{let e=document.head.querySelector("style[js-styles]");if(e&&!t)return;let o=y(window.joystick?._internal?.tree).reverse().join("").trim(),c=btoa(`${o.trim()}`).substring(0,8);if(e&&(e.setAttribute("js-css",c),e.innerHTML=o),!e){let m=document.createElement("style");m.setAttribute("js-styles",""),m.setAttribute("js-css",c),m.innerHTML=o,document.head.appendChild(m)}}catch(e){p("component.css.appendToHead",e)}};export{L as default};
