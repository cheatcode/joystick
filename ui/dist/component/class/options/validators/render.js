var e=(r="",t={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${t.message||t.reason||t}`)};var o=r=>{try{return typeof r=="function"}catch(t){e("types.isFunction",t)}};var y=(r=null)=>{try{o(r)||e("component.optionValidators.render","options.render must be a function returning a string.")}catch(t){e("component.optionValidators.render",t)}};export{y as default};
