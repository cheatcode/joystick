var t=(o="",r={})=>{throw new Error(`[joystick${o?`.${o}`:""}] ${r.message||r.reason||r}`)};var c=(o="",r=[])=>{try{console.error(`${o} failed with the following errors:`),r.forEach(e=>{console.log(e.message),e.stack&&console.log(e.stack)})}catch(e){t(o,e)}};export{c as default};
