var e=(r="",t={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${t.message||t.reason||t}`)};var o=r=>{try{return typeof r=="string"}catch(t){e("types.isString",t)}};var y=(r={})=>{try{return{...r,isActive:(t="")=>o(t)&&r?.route!=="*"?t===(typeof location!="undefined"?location.pathname:r.path):!1}}catch(t){e("component.url.compile",t)}};export{y as default};
