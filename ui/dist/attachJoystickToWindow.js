var t=(r="",o={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${o.message||o.reason||o}`)};var e=(r={})=>{try{typeof window!="undefined"&&(window.joystick={...window.joystick||{},settings:window.__joystick_settings__,...r})}catch(o){t("attachJoystickToWindow",o)}};export{e as default};
