var o=(e="",t={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${t.message||t.reason||t}`)};var r=e=>{try{return typeof e=="function"}catch(t){o("types.isFunction",t)}};var n=e=>{try{return!!(e&&typeof e=="object"&&!Array.isArray(e))}catch(t){o("types.isObject",t)}};var c=["onBeforeMount","onMount","onUpdateProps","onBeforeUnmount"];var m=(e=null)=>{try{n(e)||o("component.optionValidators.lifecycle","options.lifecycle must be an object.");for(let[t,i]of Object.entries(e))c.includes(t)||o("component.optionValidators.lifecycle",`options.lifecycle.${t} is not supported.`),r(i)||o("component.optionValidators.lifecycle",`options.lifecycle.${t} must be assigned a function.`)}catch(t){o("component.optionValidators.lifecycle",t)}};export{m as default};
