var o=(e="",t={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${t.message||t.reason||t}`)};var p=["render"];var c=(e={})=>{try{return p.every(t=>Object.keys(e).includes(t))}catch(t){o("component.hasAllRequiredOptions",t)}};var l=["_componentId","_ssrId","api","dataFromSSR","existingProps","existingState","instanceId","parent","req","css","data","defaultProps","events","id","lifecycle","methods","name","props","render","state","translations","url","websockets","wrapper"];var m=e=>{try{return!!Array.isArray(e)}catch(t){o("types.isArray",t)}};var r=e=>{try{return typeof e=="function"}catch(t){o("types.isFunction",t)}};var i=e=>{try{return!!(e&&typeof e=="object"&&!Array.isArray(e))}catch(t){o("types.isObject",t)}};var s=e=>{try{return typeof e=="string"}catch(t){o("types.isString",t)}};var d=(e=null)=>{try{!s(e)&&!r(e)&&!i(e)&&o("component.optionValidators.css","options.css must be a string, function returning a string, or an object returning breakpoints.")}catch(t){o("component.optionValidators.css",t)}};var u=["readystatechange","pointerlockchange","pointerlockerror","beforecopy","beforecut","beforepaste","freeze","resume","search","securitypolicyviolation","visibilitychange","fullscreenchange","fullscreenerror","webkitfullscreenchange","webkitfullscreenerror","beforexrselect","abort","blur","cancel","canplay","canplaythrough","change","click","close","contextmenu","cuechange","dblclick","drag","dragend","dragenter","dragleave","dragover","dragstart","drop","durationchange","emptied","ended","error","focus","formdata","input","invalid","keydown","keypress","keyup","load","loadeddata","loadedmetadata","loadstart","mousedown","mouseenter","mouseleave","mousemove","mouseout","mouseover","mouseup","mousewheel","pause","play","playing","progress","ratechange","reset","resize","scroll","seeked","seeking","select","stalled","submit","suspend","timeupdate","toggle","volumechange","waiting","webkitanimationend","webkitanimationiteration","webkitanimationstart","webkittransitionend","wheel","auxclick","gotpointercapture","lostpointercapture","pointerdown","pointermove","pointerup","pointercancel","pointerover","pointerout","pointerenter","pointerleave","selectstart","selectionchange","animationend","animationiteration","animationstart","transitionrun","transitionstart","transitionend","transitioncancel","copy","cut","paste","pointerrawupdate"];var f=(e=null)=>{try{i(e)||o("component.optionValidators.events","options.events must be an object.");for(let t of Object.keys(e)){let[n]=t.split(" ");u.includes(n)||o("component.optionValidators.events",`${n} is not a supported JavaScript event type.`)}for(let[t,n]of Object.entries(e))r(n)||o("component.optionValidators.events",`options.events.${t} must be assigned a function.`)}catch(t){o("component.optionValidators.events",t)}};var y=["onBeforeMount","onMount","onUpdateProps","onBeforeUnmount","onRefetchData"];var w=(e=null)=>{try{i(e)||o("component.optionValidators.lifecycle","options.lifecycle must be an object.");for(let[t,n]of Object.entries(e))y.includes(t)||o("component.optionValidators.lifecycle",`options.lifecycle.${t} is not supported.`),r(n)||o("component.optionValidators.lifecycle",`options.lifecycle.${t} must be assigned a function.`)}catch(t){o("component.optionValidators.lifecycle",t)}};var b=(e=null)=>{try{i(e)||o("component.optionValidators.methods","options.methods must be an object.");for(let[t,n]of Object.entries(e))r(n)||o("component.optionValidators.methods",`options.methods.${t} must be assigned a function.`)}catch(t){o("component.optionValidators.methods",t)}};var h=(e=null)=>{typeof e!="string"&&o("component.optionValidators.name","options.name must be a string.")};var g=(e=null)=>{try{r(e)||o("component.optionValidators.render","options.render must be a function returning a string.")}catch(t){o("component.optionValidators.render",t)}};var x=(e=null)=>{try{r(e)||o("component.optionValidators.websockets","options.websockets must be a function returning an object.")}catch(t){o("component.optionValidators.websockets",t)}};var k=(e=null)=>{try{i(e)||o("component.optionValidators.wrapper","options.wrapper must be an object.");for(let[t,n]of Object.entries(e))t==="id"&&!s(n)&&o("component.optionValidators.wrapper",`options.wrapper.${t} must be assigned a string.`),t==="classList"&&!m(n)&&o("component.optionValidators.wrapper",`options.wrapper.${t} must be assigned an array of strings.`)}catch(t){o("component.optionValidators.wrapper",t)}};var F={css:d,events:f,lifecycle:w,methods:b,name:h,render:g,websockets:x,wrapper:k};var gt=(e={})=>{try{c(e)||o("component.validateOptions",`component options must include ${required.options.join(",")}.`);for(let[t,n]of Object.entries(e)){l.includes(t)||o("component.validateOptions",`${t} is not supported by joystick.component.`);let a=F[t];a&&r(a)&&a(n)}}catch(t){o("component.validateOptions",t)}};export{gt as default};
