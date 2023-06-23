var a=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var c=t=>{try{return typeof t=="function"}catch(e){a("types.isFunction",e)}};var h=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){a("types.isObject",e)}};var m=t=>{try{return typeof t=="string"}catch(e){a("types.isString",e)}};var j=(t="",e={})=>{try{let n="";if(t&&m(t))return n=t,n;if(t&&c(t))return n=t(e),n;if(t&&h(t)){let y=t?.print&&(m(t?.print)||c(t?.print)),x=t?.min&&h(t?.min),s=t?.min?.width&&h(t?.min?.width),f=t?.min?.height&&h(t?.min?.height),u=t?.max&&h(t?.max),d=t?.max?.width&&h(t?.max?.width),l=t?.max?.height&&h(t?.max?.height);if(y&&(n+=`
          @media print {
            ${typeof t?.print=="function"?t?.print(e):t.print}
          }
        `),x&&s){let o=Object.entries(t?.min?.width);for(let i=0;i<o.length;i+=1){let[p,r]=o[i];n+=`
            @media screen and (min-width: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(x&&f){let o=Object.entries(t?.min?.height);for(let i=0;i<o.length;i+=1){let[p,r]=o[i];n+=`
            @media screen and (min-height: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(u&&d){let o=Object.entries(t?.max?.width);for(let i=0;i<o.length;i+=1){let[p,r]=o[i];n+=`
            @media screen and (max-width: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(u&&l){let o=Object.entries(t?.max?.height);for(let i=0;i<o.length;i+=1){let[p,r]=o[i];n+=`
            @media screen and (max-height: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}return n}return""}catch(n){a("component.css.compileCSS",n)}};export{j as default};
