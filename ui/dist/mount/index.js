var r=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var c=t=>{try{return t instanceof Element}catch(e){r("types.isDOM",e)}};var s=t=>{try{return typeof t=="function"}catch(e){r("types.isFunction",e)}};var p=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){r("types.isObject",e)}};var u=(t={})=>{try{window.joystick._internal.tree={id:t?.id||null,instance:t,children:[]}}catch(e){r("mount.initializeJoystickComponentTree",e)}};var a=()=>typeof window=="undefined";var f=(t="")=>{try{let[e,n]=t?.split(".");return n?window?.joystick?._internal?.queues[e][n]:window?.joystick?._internal?.queues[e]}catch(e){r("processQueue.getQueue",e)}},i=(t="")=>{try{a()||(f(t)||{}).process()}catch(e){r("processQueue",e)}};var y=(t={},e=null)=>{try{return t.innerHTML="",t.appendChild(e),e}catch(n){r("mount.appendToDOM",n)}};var D=(t=null,e={},n=null)=>{try{s(t)||r("mount","Component to mount must be a function."),p(e)||r("mount","props must be an object."),c(n)||r("mount","target must be a DOM node.");let o=t({props:e});u(o);let m=o.render({mounting:!0});o.lifecycle.onBeforeMount(),i("lifecycle.onBeforeMount"),y(n,m),o.setDOMNodeOnInstance(),o.appendCSSToHead(o),o.attachEventsToDOM(o),i("eventListeners"),o.lifecycle.onMount(),i("lifecycle.onMount")}catch(o){r("mount",o)}};export{D as default};
