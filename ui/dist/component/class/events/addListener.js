var n=(r="",t={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${t.message||t.reason||t}`)};var i=(r=16)=>{let t=[],e=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];for(let o=0;o<r;o++)t.push(e[Math.floor(Math.random()*16)]);return t.join("")};var c=r=>{try{return r instanceof Element}catch(t){n("types.isDOM",t)}};var p=r=>{try{return typeof r=="function"}catch(t){n("types.isFunction",t)}};var m=({componentId:r="",parentId:t="",element:e=null,eventType:o=null,eventListener:s=null})=>{try{e&&c(e)&&o&&s&&p(s)&&(e.addEventListener(o,s),window.joystick._internal.eventListeners.push({eventId:i(8),componentId:r,parentId:t,element:e,eventType:o,eventListener:s}))}catch(y){n("component.events.addListener",y)}};export{m as default};
