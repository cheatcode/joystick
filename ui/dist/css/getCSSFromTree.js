var p=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var x=t=>{try{return typeof t=="function"}catch(e){p("types.isFunction",e)}};var c=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){p("types.isObject",e)}};var u=t=>{try{return typeof t=="string"}catch(e){p("types.isString",e)}};var d=(t="",e={})=>{try{let i="";if(t&&u(t))return i=t,i;if(t&&x(t))return i=t(e),i;if(t&&c(t)){let s=t?.print&&(u(t?.print)||x(t?.print)),a=t?.min&&c(t?.min),m=t?.min?.width&&c(t?.min?.width),f=t?.min?.height&&c(t?.min?.height),l=t?.max&&c(t?.max),g=t?.max?.width&&c(t?.max?.width),w=t?.max?.height&&c(t?.max?.height);if(s&&(i+=`
          @media print {
            ${typeof t?.print=="function"?t?.print(e):t.print}
          }
        `),a&&m){let o=Object.entries(t?.min?.width);for(let n=0;n<o.length;n+=1){let[h,r]=o[n];i+=`
            @media screen and (min-width: ${h}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(a&&f){let o=Object.entries(t?.min?.height);for(let n=0;n<o.length;n+=1){let[h,r]=o[n];i+=`
            @media screen and (min-height: ${h}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(l&&g){let o=Object.entries(t?.max?.width);for(let n=0;n<o.length;n+=1){let[h,r]=o[n];i+=`
            @media screen and (max-width: ${h}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}if(l&&w){let o=Object.entries(t?.max?.height);for(let n=0;n<o.length;n+=1){let[h,r]=o[n];i+=`
            @media screen and (max-height: ${h}px) {
              ${typeof r=="function"?r(e):r}
            }
          `}}return i}return""}catch(i){p("component.css.compileCSS",i)}};var R=new RegExp(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g),S=new RegExp(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g),b=(t,e)=>(e||"").replace(R,()=>"").replace(S,i=>["@",": "].some(s=>i?.includes(s))?i:`[js-c="${t}"] ${i.trim()}`)?.trim(),y=(t={},e=[])=>{if(t.instance&&t.instance.options&&t.instance.options.css){let i=t.instance.id,s=t.instance.options.css,a=d(s,t.instance),m=b(i,a);e.push(m)}if(t.children&&t.children.length>0){let i=t?.children?.length||0;for(;i--;)y(t.children[i],e)}return e},M=y;export{M as default};
