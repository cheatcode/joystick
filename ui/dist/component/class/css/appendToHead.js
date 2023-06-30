var h=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var l=t=>{try{return typeof t=="function"}catch(e){h("types.isFunction",e)}};var p=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){h("types.isObject",e)}};var u=t=>{try{return typeof t=="string"}catch(e){h("types.isString",e)}};var d=(t="",e={})=>{try{let r="";if(t&&u(t))return r=t,r;if(t&&l(t))return r=t(e),r;if(t&&p(t)){let c=t?.print&&(u(t?.print)||l(t?.print)),o=t?.min&&p(t?.min),a=t?.min?.width&&p(t?.min?.width),g=t?.min?.height&&p(t?.min?.height),x=t?.max&&p(t?.max),w=t?.max?.width&&p(t?.max?.width),S=t?.max?.height&&p(t?.max?.height);if(c&&(r+=`
          @media print {
            ${typeof t?.print=="function"?t?.print(e):t.print}
          }
        `),o&&a){let s=Object.entries(t?.min?.width);for(let i=0;i<s.length;i+=1){let[m,n]=s[i];r+=`
            @media screen and (min-width: ${m}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}if(o&&g){let s=Object.entries(t?.min?.height);for(let i=0;i<s.length;i+=1){let[m,n]=s[i];r+=`
            @media screen and (min-height: ${m}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}if(x&&w){let s=Object.entries(t?.max?.width);for(let i=0;i<s.length;i+=1){let[m,n]=s[i];r+=`
            @media screen and (max-width: ${m}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}if(x&&S){let s=Object.entries(t?.max?.height);for(let i=0;i<s.length;i+=1){let[m,n]=s[i];r+=`
            @media screen and (max-height: ${m}px) {
              ${typeof n=="function"?n(e):n}
            }
          `}}return r}return""}catch(r){h("component.css.compileCSS",r)}};var b=(t,e)=>{let r=new RegExp(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g),c=new RegExp(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g);return(e||"").replace(r,o=>"").replace(c,o=>["@",": "].some(a=>o?.includes(a))?o:`[js-c="${t}"] ${o.trim()}`)?.trim()},y=(t={},e=[])=>{if(t.instance&&t.instance.options&&t.instance.options.css){let r=t.instance.id,c=t.instance.options.css,o=d(c,t.instance),a=b(r,o);e.push(a)}if(t.children&&t.children.length>0){let r=t?.children?.length||0;for(;r--;)y(t.children[r],e)}return e},f=y;var T=()=>{try{let t=document.head.querySelector("style[js-styles]"),r=f(window.joystick?._internal?.tree).reverse().join("").trim(),c=btoa(`${r.trim()}`).substring(0,8);if(t&&(t.setAttribute("js-css",c),t.innerHTML=r),!t){let o=document.createElement("style");o.setAttribute("js-styles",""),o.setAttribute("js-css",c),o.innerHTML=r,document.head.appendChild(o)}}catch(t){h("component.css.appendToHead",t)}};export{T as default};
