var i=(t="",r={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${r.message||r.reason||r}`)};var l=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(r){i("types.isObject",r)}};var u=(t={},r="",n="id")=>{try{let e=t&&t.id;if(l(t)&&e){let y=Object.keys(t);for(let c=0;c<y.length;c+=1){let s=y[c],o=t[s];if(s===n&&o===r)return t;if(s==="children"&&Array.isArray(o))for(let p=0;p<o.length;p+=1){let d=o[p],a=u(d,r,n);if(a!==null)return a}}}return null}catch(e){i("component.findComponentInTreeByField",e)}},x=u;var k=(t="",r={},n=null)=>{let e=x(n||window.joystick._internal.tree,t,"instanceId");e&&(e.children=[...e.children||[],r])};export{k as default};
