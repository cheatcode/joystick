var e=(t="",r={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${r.message||r.reason||r}`)};var o=t=>{try{return typeof t=="function"}catch(r){e("types.isFunction",r)}};var n=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(r){e("types.isObject",r)}};var s=t=>{try{return typeof t=="string"}catch(r){e("types.isString",r)}};var x=(t=null)=>{try{!s(t)&&!o(t)&&!n(t)&&e("component.optionValidators.css","options.css must be a string, function returning a string, or an object returning breakpoints.")}catch(r){e("component.optionValidators.css",r)}};export{x as default};
