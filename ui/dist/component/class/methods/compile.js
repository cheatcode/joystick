var o=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var s=(r={},e={})=>{try{return Object.entries(e).reduce((t={},[d,u])=>(t[d]=(...w)=>u(...w,{...r,setState:r.setState.bind(r),...r.renderMethods||{}}),t),{})}catch{o("component.methods.compile")}};export{s as default};
