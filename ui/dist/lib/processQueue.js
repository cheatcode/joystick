var o=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var t=()=>typeof window=="undefined";var n=(r="")=>{try{let[e,u]=r?.split(".");return u?window?.joystick?._internal?.queues[e][u]:window?.joystick?._internal?.queues[e]}catch(e){o("processQueue.getQueue",e)}},p=(r="")=>{try{t()||(n(r)||{}).process()}catch(e){o("processQueue",e)}};export{p as default};
