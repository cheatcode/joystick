var o=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var t=()=>typeof window=="undefined";var n=(r="")=>{try{let[e,u]=r?.split(".");return u?window?.joystick?._internal?.queues[e][u]:window?.joystick?._internal?.queues[e]}catch(e){o("addToQueue.getQueue",e)}},c=(r="",e=null)=>{try{t()||(n(r)||{}).array.push({callback:e})}catch(u){o("addToQueue",u)}};export{c as default};
