var o=(r="",t={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${t.message||t.reason||t}`)};var i=r=>{try{return typeof r=="function"}catch(t){o("types.isFunction",t)}};var u=async(r={},t={},n={},e={})=>{try{if(e?.options?.data&&i(e.options.data)){let s=await e.options.data(r,t,n,e);return Promise.resolve(s)}return Promise.resolve()}catch(s){o("component.data.fetch",s)}};export{u as default};
