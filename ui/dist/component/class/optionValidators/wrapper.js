var e=(r="",t={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${t.message||t.reason||t}`)};var n=r=>{try{return!!Array.isArray(r)}catch(t){e("types.isArray",t)}};var s=r=>{try{return!!(r&&typeof r=="object"&&!Array.isArray(r))}catch(t){e("types.isObject",t)}};var i=r=>{try{return typeof r=="string"}catch(t){e("types.isString",t)}};var x=(r=null)=>{try{s(r)||e("component.optionValidators.wrapper","options.wrapper must be an object.");for(let[t,o]of Object.entries(r))t==="id"&&!i(o)&&e("component.optionValidators.wrapper",`options.wrapper.${t} must be assigned a string.`),t==="classList"&&!n(o)&&e("component.optionValidators.wrapper",`options.wrapper.${t} must be assigned an array of strings.`)}catch(t){e("component.optionValidators.wrapper",t)}};export{x as default};
