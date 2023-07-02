var s=(t="",r={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${r.message||r.reason||r}`)};var l=t=>{try{return typeof t=="function"}catch(r){s("types.isFunction",r)}};var p=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(r){s("types.isObject",r)}};var u=t=>{try{return typeof t=="string"}catch(r){s("types.isString",r)}};var d=(t="",r={})=>{try{let e="";if(t&&u(t))return e=t,e;if(t&&l(t))return e=t(r),e;if(t&&p(t)){let c=t?.print&&(u(t?.print)||l(t?.print)),m=t?.min&&p(t?.min),a=t?.min?.width&&p(t?.min?.width),g=t?.min?.height&&p(t?.min?.height),x=t?.max&&p(t?.max),w=t?.max?.width&&p(t?.max?.width),S=t?.max?.height&&p(t?.max?.height);if(c&&(e+=`
          @media print {
            ${typeof t?.print=="function"?t?.print(r):t.print}
          }
        `),m&&a){let o=Object.entries(t?.min?.width);for(let i=0;i<o.length;i+=1){let[h,n]=o[i];e+=`
            @media screen and (min-width: ${h}px) {
              ${typeof n=="function"?n(r):n}
            }
          `}}if(m&&g){let o=Object.entries(t?.min?.height);for(let i=0;i<o.length;i+=1){let[h,n]=o[i];e+=`
            @media screen and (min-height: ${h}px) {
              ${typeof n=="function"?n(r):n}
            }
          `}}if(x&&w){let o=Object.entries(t?.max?.width);for(let i=0;i<o.length;i+=1){let[h,n]=o[i];e+=`
            @media screen and (max-width: ${h}px) {
              ${typeof n=="function"?n(r):n}
            }
          `}}if(x&&S){let o=Object.entries(t?.max?.height);for(let i=0;i<o.length;i+=1){let[h,n]=o[i];e+=`
            @media screen and (max-height: ${h}px) {
              ${typeof n=="function"?n(r):n}
            }
          `}}return e}return""}catch(e){s("component.css.compileCSS",e)}};var R=new RegExp(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g),b=new RegExp(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g),F=(t,r)=>(r||"").replace(R,()=>"").replace(b,e=>["@",": "].some(c=>e?.includes(c))?e:`[js-c="${t}"] ${e.trim()}`)?.trim(),y=(t={},r=[])=>{if(t.instance&&t.instance.options&&t.instance.options.css){let e=t.instance.id,c=t.instance.options.css,m=d(c,t.instance),a=F(e,m);r.push(a)}if(t.children&&t.children.length>0){let e=t?.children?.length||0;for(;e--;)y(t.children[e],r)}return r},f=y;var W=()=>{try{let t=document.head.querySelector("style[js-styles]"),e=f(window.joystick?._internal?.tree).reverse().join("").trim();if(t?.innerText===e)return;if(t&&(t.innerHTML=e),!t){let c=document.createElement("style");c.setAttribute("js-styles",""),c.innerHTML=e,document.head.appendChild(c)}}catch(t){s("css.update",t)}};export{W as default};
