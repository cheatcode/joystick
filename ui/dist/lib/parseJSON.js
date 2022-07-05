var e=(o="",r={})=>{throw new Error(`[joystick${o?`.${o}`:""}] ${r.message||r.reason||r}`)};var s=(o="{}")=>{try{return JSON.parse(o)}catch(r){e("parseJSON",r)}};export{s as default};
