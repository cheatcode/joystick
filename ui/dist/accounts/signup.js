!function(o,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(o="undefined"!=typeof globalThis?globalThis:o||self)["joystick-ui"]=e()}(this,(function(){"use strict";return(o={})=>((o="",e={})=>{if(fetch)return new Promise(((n,i)=>{const t={signup:"signup",login:"login",logout:"logout",recoverPassword:"recover-password",resetPassword:"reset-password"}[o];return fetch(`${window.location.origin}/api/_accounts/${t}`,{method:"POST",mode:"cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({...e,origin:window?.location?.origin}),credentials:"include"}).then((async e=>{const t=await e.json();return t&&t.errors?(console.log(`%c❌ accounts.${o} request failed with the following errors:`,'background-color: #ffcc00; padding: 7px; font-family: "inherit"; font-size: 11px; line-height: 10px; color: #000;'),t.errors.forEach((o=>{console.log(o.message),o.stack&&console.log(o.stack)})),i(t)):(n(t),t)})).catch((e=>(console.log(`%c❌ accounts.${o} request failed with the following network error:`,'background-color: #ffcc00; padding: 7px; font-family: "inherit"; font-size: 11px; line-height: 10px; color: #000;'),console.log(e),i(e),e)))}))})("signup",o)}));
