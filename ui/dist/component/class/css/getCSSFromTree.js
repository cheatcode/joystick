var a=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var x=t=>{try{return typeof t=="function"}catch(e){a("types.isFunction",e)}};var c=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){a("types.isObject",e)}};var u=t=>{try{return typeof t=="string"}catch(e){a("types.isString",e)}};var d=(t="",e={})=>{try{let i="";if(t&&u(t))return i=t,i;if(t&&x(t))return i=t(e),i;if(t&&c(t)){let h=t?.print&&(u(t?.print)||x(t?.print)),s=t?.min&&c(t?.min),m=t?.min?.width&&c(t?.min?.width),y=t?.min?.height&&c(t?.min?.height),l=t?.max&&c(t?.max),g=t?.max?.width&&c(t?.max?.width),w=t?.max?.height&&c(t?.max?.height);if(h&&(i+=`
          @media print {
            ${typeof t?.print=="function"?t?.print(e):t.print}
          }
        `),s&&m){let o=Object.entries(t?.min?.width);for(let n=0;n<o.length;n+=1){let[p,r]=o[n];i+=`
            @media screen and (min-width: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(s&&y){let o=Object.entries(t?.min?.height);for(let n=0;n<o.length;n+=1){let[p,r]=o[n];i+=`
            @media screen and (min-height: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(l&&g){let o=Object.entries(t?.max?.width);for(let n=0;n<o.length;n+=1){let[p,r]=o[n];i+=`
            @media screen and (max-width: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(l&&w){let o=Object.entries(t?.max?.height);for(let n=0;n<o.length;n+=1){let[p,r]=o[n];i+=`
            @media screen and (max-height: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}return i}return""}catch(i){a("component.css.compileCSS",i)}};var S=(t,e)=>{let i=new RegExp(/^(?!@).+({|,)/gim);return(e||"").replace(i,h=>["@",": "].some(s=>h?.includes(s))?h:`[js-c="${t}"] ${h.trim()}`)?.trim()},f=(t={},e=[])=>{if(t.instance&&t.instance.options&&t.instance.options.css){let i=t.instance.id,h=t.instance.options.css,s=d(h,t.instance),m=S(i,s);e.push(m)}if(t.children&&t.children.length>0){let i=t?.children?.length||0;for(;i--;)f(t.children[i],e)}return e},C=f;export{C as default};
