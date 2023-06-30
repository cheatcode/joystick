var s=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var x=t=>{try{return typeof t=="function"}catch(e){s("types.isFunction",e)}};var h=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){s("types.isObject",e)}};var u=t=>{try{return typeof t=="string"}catch(e){s("types.isString",e)}};var d=(t="",e={})=>{try{let i="";if(t&&u(t))return i=t,i;if(t&&x(t))return i=t(e),i;if(t&&h(t)){let a=t?.print&&(u(t?.print)||x(t?.print)),c=t?.min&&h(t?.min),m=t?.min?.width&&h(t?.min?.width),y=t?.min?.height&&h(t?.min?.height),l=t?.max&&h(t?.max),g=t?.max?.width&&h(t?.max?.width),w=t?.max?.height&&h(t?.max?.height);if(a&&(i+=`
          @media print {
            ${typeof t?.print=="function"?t?.print(e):t.print}
          }
        `),c&&m){let o=Object.entries(t?.min?.width);for(let n=0;n<o.length;n+=1){let[p,r]=o[n];i+=`
            @media screen and (min-width: ${p}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(c&&y){let o=Object.entries(t?.min?.height);for(let n=0;n<o.length;n+=1){let[p,r]=o[n];i+=`
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
          `}}return i}return""}catch(i){s("component.css.compileCSS",i)}};var R=(t,e)=>{let i=new RegExp(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g),a=new RegExp(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g);return(e||"").replace(i,c=>"").replace(a,c=>["@",": "].some(m=>c?.includes(m))?c:`[js-c="${t}"] ${c.trim()}`)?.trim()},f=(t={},e=[])=>{if(t.instance&&t.instance.options&&t.instance.options.css){let i=t.instance.id,a=t.instance.options.css,c=d(a,t.instance),m=R(i,c);e.push(m)}if(t.children&&t.children.length>0){let i=t?.children?.length||0;for(;i--;)f(t.children[i],e)}return e},C=f;export{C as default};
