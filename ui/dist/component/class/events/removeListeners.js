var t=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var s=(r=[])=>{try{for(let e of r)e.element&&e.eventType&&e.eventListener&&e.element.removeEventListener(e.eventType,e.eventListener)}catch(e){t("component.events.removeListeners",e)}};export{s as default};
