var Gt=Object.create;var re=Object.defineProperty;var Kt=Object.getOwnPropertyDescriptor;var Jt=Object.getOwnPropertyNames;var Wt=Object.getPrototypeOf,Qt=Object.prototype.hasOwnProperty;var Yt=t=>re(t,"__esModule",{value:!0});var Xt=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var er=(t,e,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of Jt(e))!Qt.call(t,o)&&o!=="default"&&re(t,o,{get:()=>e[o],enumerable:!(r=Kt(e,o))||r.enumerable});return t},tr=t=>er(Yt(re(t!=null?Gt(Wt(t)):{},"default",t&&t.__esModule&&"default"in t?{get:()=>t.default,enumerable:!0}:{value:t,enumerable:!0})),t);var xt=Xt(K=>{(function(t,e){if(typeof define=="function"&&define.amd)define(["exports"],e);else if(typeof K!="undefined")e(K);else{var r={exports:{}};e(r.exports),t.index=r.exports}})(K,function(t){"use strict";function e(p){return e=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(a){return typeof a}:function(a){return a&&typeof Symbol=="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},e(p)}function r(p,a){return a&&(e(a)==="object"||typeof a=="function")?a:o(p)}function o(p){if(p===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return p}function n(p){return n=Object.setPrototypeOf?Object.getPrototypeOf:function(a){return a.__proto__||Object.getPrototypeOf(a)},n(p)}function s(p,a){if(typeof a!="function"&&a!==null)throw new TypeError("Super expression must either be null or a function");p.prototype=Object.create(a&&a.prototype,{constructor:{value:p,writable:!0,configurable:!0}}),a&&d(p,a)}function d(p,a){return d=Object.setPrototypeOf||function(y,S){return y.__proto__=S,y},d(p,a)}function c(p,a){if(!(p instanceof a))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0}),t.diff=void 0;var u=function p(a,y){c(this,p),this.type=a,this.path=y?y.toString():""},N=function(p){function a(y,S,m){var T;return c(this,a),T=r(this,n(a).call(this,"E",y)),T.lhs=S,T.rhs=m,T}return s(a,p),a}(u),V=function(p){function a(y,S,m,T){var x;return c(this,a),x=r(this,n(a).call(this,"M",y)),x.item=S,x.lhsIndex=m,x.rhsIndex=T,x}return s(a,p),a}(u),ee=function(p){function a(y,S){var m;return c(this,a),m=r(this,n(a).call(this,"D",y)),m.lhs=S,m}return s(a,p),a}(u),te=function(p){function a(y,S){var m;return c(this,a),m=r(this,n(a).call(this,"A",y)),m.rhs=S,m}return s(a,p),a}(u),O=function(p,a){return p?"".concat(p,".").concat(a):a};t.diff=function(a,y){var S=2<arguments.length&&arguments[2]!==void 0?arguments[2]:{},m=[],T=S.matchKey,x=S.types||["E","A","D","M"],Zt=function(g,h,b,C){g.forEach(function(v,$){var k=h.findIndex(function(E){return E[C]===v[C]});-1<k?(-1<x.indexOf("M")&&$!==k&&m.push(new V(b,v,$,k)),U(v,h[k],O(b,k))):-1<x.indexOf("D")&&m.push(new ee(b,v))}),h.forEach(function(v,$){var k=g.findIndex(function(E){return v[C]===E[C]});-1<x.indexOf("A")&&k===-1&&m.push(new te(O(b,$),v))})},U=function(g,h,b){var C=Object.prototype.toString.call(g),v=Object.prototype.toString.call(h);if(-1<x.indexOf("E")&&C!==v)return m.push(new N(b,g,h)),!1;if(C==="[object Object]")Object.getOwnPropertyNames(g).forEach(function(E){Object.prototype.hasOwnProperty.call(h,E)?U(g[E],h[E],O(b,E)):-1<x.indexOf("D")&&m.push(new ee(O(b,E),g[E]))}),Object.getOwnPropertyNames(h).forEach(function(E){-1<x.indexOf("A")&&!Object.prototype.hasOwnProperty.call(g,E)&&m.push(new te(O(b,E),h[E]))});else if(C!=="[object Array]")-1<x.indexOf("E")&&g!==h&&m.push(new N(b,g,h));else if(T)Zt(g,h,b,T);else{var $=g.length-1,k=h.length-1;if(-1<x.indexOf("D"))for(;$>k;)m.push(new ee(O(b,$),g[$--]));if(-1<x.indexOf("A"))for(;k>$;)m.push(new te(O(b,k),h[k--]));for(;0<=$;--$)U(g[$],h[$],O(b,$))}};return U(a,y),m}})});var i=(t="",e={})=>{throw new Error(`[joystick${t?`.${t}`:""}] ${e.message||e.reason||e}`)};var me=["render"];var ue=(t={})=>{try{return me.every(e=>Object.keys(t).includes(e))}catch(e){i("component.hasAllRequiredOptions",e)}};var fe=["_componentId","_ssrId","api","dataFromSSR","existingProps","existingState","instanceId","req","css","data","defaultProps","events","id","lifecycle","methods","name","props","render","state","translations","url","websockets","wrapper"];var he=t=>{try{return typeof t=="undefined"}catch(e){i("types.isUndefined",e)}},we=t=>{try{return t===null}catch(e){i("types.isNull",e)}};var A=t=>{try{return!!Array.isArray(t)}catch(e){i("types.isArray",e)}};var l=t=>{try{return typeof t=="function"}catch(e){i("types.isFunction",e)}};var f=t=>{try{return!!(t&&typeof t=="object"&&!Array.isArray(t))}catch(e){i("types.isObject",e)}};var M=t=>{try{return typeof t=="string"}catch(e){i("types.isString",e)}};var ye=(t=null)=>{try{!M(t)&&!l(t)&&i("component.optionValidators.css","options.css must be a string or function returning a string.")}catch(e){i("component.optionValidators.css",e)}};var xe=["readystatechange","pointerlockchange","pointerlockerror","beforecopy","beforecut","beforepaste","freeze","resume","search","securitypolicyviolation","visibilitychange","fullscreenchange","fullscreenerror","webkitfullscreenchange","webkitfullscreenerror","beforexrselect","abort","blur","cancel","canplay","canplaythrough","change","click","close","contextmenu","cuechange","dblclick","drag","dragend","dragenter","dragleave","dragover","dragstart","drop","durationchange","emptied","ended","error","focus","formdata","input","invalid","keydown","keypress","keyup","load","loadeddata","loadedmetadata","loadstart","mousedown","mouseenter","mouseleave","mousemove","mouseout","mouseover","mouseup","mousewheel","pause","play","playing","progress","ratechange","reset","resize","scroll","seeked","seeking","select","stalled","submit","suspend","timeupdate","toggle","volumechange","waiting","webkitanimationend","webkitanimationiteration","webkitanimationstart","webkittransitionend","wheel","auxclick","gotpointercapture","lostpointercapture","pointerdown","pointermove","pointerup","pointercancel","pointerover","pointerout","pointerenter","pointerleave","selectstart","selectionchange","animationend","animationiteration","animationstart","transitionrun","transitionstart","transitionend","transitioncancel","copy","cut","paste","pointerrawupdate"];var ge=(t=null)=>{try{f(t)||i("component.optionValidators.events","options.events must be an object.");for(let e of Object.keys(t)){let[r]=e.split(" ");xe.includes(r)||i("component.optionValidators.events",`${r} is not a supported JavaScript event type.`)}for(let[e,r]of Object.entries(t))l(r)||i("component.optionValidators.events",`options.events.${e} must be assigned a function.`)}catch(e){i("component.optionValidators.events",e)}};var be=["onBeforeMount","onMount","onUpdateProps","onBeforeUnmount","onRefetchData"];var $e=(t=null)=>{try{f(t)||i("component.optionValidators.lifecycle","options.lifecycle must be an object.");for(let[e,r]of Object.entries(t))be.includes(e)||i("component.optionValidators.lifecycle",`options.lifecycle.${e} is not supported.`),l(r)||i("component.optionValidators.lifecycle",`options.lifecycle.${e} must be assigned a function.`)}catch(e){i("component.optionValidators.lifecycle",e)}};var Ee=(t=null)=>{try{f(t)||i("component.optionValidators.methods","options.methods must be an object.");for(let[e,r]of Object.entries(t))l(r)||i("component.optionValidators.methods",`options.methods.${e} must be assigned a function.`)}catch(e){i("component.optionValidators.methods",e)}};var Fe=(t=null)=>{typeof t!="string"&&i("component.optionValidators.name","options.name must be a string.")};var Se=(t=null)=>{try{l(t)||i("component.optionValidators.render","options.render must be a function returning a string.")}catch(e){i("component.optionValidators.render",e)}};var ke=(t=null)=>{try{l(t)||i("component.optionValidators.websockets","options.websockets must be a function returning an object.")}catch(e){i("component.optionValidators.websockets",e)}};var Me=(t=null)=>{try{f(t)||i("component.optionValidators.wrapper","options.wrapper must be an object.");for(let[e,r]of Object.entries(t))e==="id"&&!M(r)&&i("component.optionValidators.wrapper",`options.wrapper.${e} must be assigned a string.`),e==="classList"&&!A(r)&&i("component.optionValidators.wrapper",`options.wrapper.${e} must be assigned an array of strings.`)}catch(e){i("component.optionValidators.wrapper",e)}};var Te={css:ye,events:ge,lifecycle:$e,methods:Ee,name:Fe,render:Se,websockets:ke,wrapper:Me};var ve=(t={})=>{try{ue(t)||i("component.validateOptions",`component options must include ${required.options.join(",")}.`);for(let[e,r]of Object.entries(t)){fe.includes(e)||i("component.validateOptions",`${e} is not supported by joystick.component.`);let o=Te[e];o&&l(o)&&o(r)}}catch(e){i("component.validateOptions",e)}};var Oe="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890".split(""),Ce=(t=16)=>{let e="",r=0;for(;r<t;)e+=Oe[Math.floor(Math.random()*(Oe.length-1))],r+=1;return e};var q=(t=[],e="")=>{try{return(A(t)&&t.find(o=>o?.componentId===e))?.data||{}}catch(r){i("findComponentDataFromSSR",r)}};var Ae=(()=>{let t=0;return(e,r)=>{clearTimeout(t),t=setTimeout(e,r)}})();var R=t=>!!(t&&typeof t=="object"&&!Array.isArray(t));var Re=t=>typeof t=="string";var Le=/^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/,De=(t,e="")=>{if(!e)return!0;if(e&&!Re(e))return!1;let r=e?e.replace(/[- ]+/g,""):"";return t===!0?r.match(new RegExp(Le)):!r.match(new RegExp(Le))};var je=/^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/,Ie=(t,e="")=>t===!0?!!e.match(je):!e.match(je);var Pe=(t,e="")=>t===e;var _e=(t,e="")=>t===e;var Ne=(t,e="")=>e.length<=t;var Ve=(t,e="")=>e.length>=t;var Ue=/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,qe=(t,e="")=>t===!0?!!e.match(Ue):!e.match(Ue);var ze={AF:/^\d{4}$/,AX:/^\d{5}$/,AL:/^\d{4}$/,DZ:/^\d{5}$/,AS:/^\d{5}(-{1}\d{4,6})$/,AD:/^[Aa][Dd]\d{3}$/,AI:/^[Aa][I][-][2][6][4][0]$/,AR:/^\d{4}|[A-Za-z]\d{4}[a-zA-Z]{3}$/,AM:/^\d{4}$/,AC:/^[Aa][Ss][Cc][Nn]\s{0,1}[1][Zz][Zz]$/,AU:/^\d{4}$/,AT:/^\d{4}$/,AZ:/^[Aa][Zz]\d{4}$/,BH:/^\d{3,4}$/,BD:/^\d{4}$/,BB:/^[Aa][Zz]\d{5}$/,BY:/^\d{6}$/,BE:/^\d{4}$/,BM:/^[A-Za-z]{2}\s([A-Za-z]{2}|\d{2})$/,BT:/^\d{5}$/,BO:/^\d{4}$/,BA:/^\d{5}$/,BR:/^\d{5}-\d{3}$/,"":/^[Bb][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,IO:/^[Bb]{2}[Nn][Dd]\s{0,1}[1][Zz]{2}$/,VG:/^[Vv][Gg]\d{4}$/,BN:/^[A-Za-z]{2}\d{4}$/,BG:/^\d{4}$/,KH:/^\d{5}$/,CA:/^(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\s{0,1}\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d$/,CV:/^\d{4}$/,KY:/^[Kk][Yy]\d[-\s]{0,1}\d{4}$/,TD:/^\d{5}$/,CL:/^\d{7}\s\(\d{3}-\d{4}\)$/,CN:/^\d{6}$/,CX:/^\d{4}$/,CC:/^\d{4}$/,CO:/^\d{6}$/,CD:/^[Cc][Dd]$/,CR:/^\d{4,5}$/,HR:/^\d{5}$/,CU:/^\d{5}$/,CY:/^\d{4}$/,CZ:/^\d{5}\s\(\d{3}\s\d{2}\)$/,DK:/^\d{4}$/,DO:/^\d{5}$/,EC:/^\d{6}$/,SV:/^1101$/,EG:/^\d{5}$/,EE:/^\d{5}$/,ET:/^\d{4}$/,FK:/^[Ff][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,FO:/^\d{3}$/,FI:/^\d{5}$/,FR:/^\d{5}$/,GF:/^973\d{2}$/,PF:/^987\d{2}$/,GA:/^\d{2}\s[a-zA-Z-_ ]\s\d{2}$/,GE:/^\d{4}$/,DE:/^\d{2}$/,GI:/^[Gg][Xx][1]{2}\s{0,1}[1][Aa]{2}$/,GR:/^\d{3}\s{0,1}\d{2}$/,GL:/^\d{4}$/,GP:/^971\d{2}$/,GU:/^\d{5}$/,GT:/^\d{5}$/,GG:/^[A-Za-z]{2}\d\s{0,1}\d[A-Za-z]{2}$/,GW:/^\d{4}$/,HT:/^\d{4}$/,HM:/^\d{4}$/,HN:/^\d{5}$/,HU:/^\d{4}$/,IS:/^\d{3}$/,IN:/^\d{6}$/,ID:/^\d{5}$/,IR:/^\d{5}-\d{5}$/,IQ:/^\d{5}$/,IM:/^[Ii[Mm]\d{1,2}\s\d\[A-Z]{2}$/,IL:/^\b\d{5}(\d{2})?$/,IT:/^\d{5}$/,JM:/^\d{2}$/,JP:/^\d{7}\s\(\d{3}-\d{4}\)$/,JE:/^[Jj][Ee]\d\s{0,1}\d[A-Za-z]{2}$/,JO:/^\d{5}$/,KZ:/^\d{6}$/,KE:/^\d{5}$/,KR:/^\d{6}\s\(\d{3}-\d{3}\)$/,XK:/^\d{5}$/,KW:/^\d{5}$/,KG:/^\d{6}$/,LV:/^[Ll][Vv][- ]{0,1}\d{4}$/,LA:/^\d{5}$/,LB:/^\d{4}\s{0,1}\d{4}$/,LS:/^\d{3}$/,LR:/^\d{4}$/,LY:/^\d{5}$/,LI:/^\d{4}$/,LT:/^[Ll][Tt][- ]{0,1}\d{5}$/,LU:/^\d{4}$/,MK:/^\d{4}$/,MG:/^\d{3}$/,MV:/^\d{4,5}$/,MY:/^\d{5}$/,MT:/^[A-Za-z]{3}\s{0,1}\d{4}$/,MH:/^\d{5}$/,MQ:/^972\d{2}$/,YT:/^976\d{2}$/,FM:/^\d{5}(-{1}\d{4})$/,MX:/^\d{5}$/,MD:/^[Mm][Dd][- ]{0,1}\d{4}$/,MC:/^980\d{2}$/,MN:/^\d{5}$/,ME:/^\d{5}$/,MS:/^[Mm][Ss][Rr]\s{0,1}\d{4}$/,MA:/^\d{5}$/,MZ:/^\d{4}$/,MM:/^\d{5}$/,NA:/^\d{5}$/,NP:/^\d{5}$/,NL:/^\d{4}\s{0,1}[A-Za-z]{2}$/,NC:/^988\d{2}$/,NZ:/^\d{4}$/,NI:/^\d{5}$/,NE:/^\d{4}$/,NG:/^\d{6}$/,NF:/^\d{4}$/,MP:/^\d{5}$/,NO:/^\d{4}$/,OM:/^\d{3}$/,PK:/^\d{5}$/,PW:/^\d{5}$/,PA:/^\d{6}$/,PG:/^\d{3}$/,PY:/^\d{4}$/,PE:/^\d{5}$/,PH:/^\d{4}$/,PN:/^[Pp][Cc][Rr][Nn]\s{0,1}[1][Zz]{2}$/,PL:/^\d{2}[- ]{0,1}\d{3}$/,PT:/^\d{4}$/,PR:/^\d{5}$/,RE:/^974\d{2}$/,RO:/^\d{6}$/,RU:/^\d{6}$/,BL:/^97133$/,SH:/^[Ss][Tt][Hh][Ll]\s{0,1}[1][Zz]{2}$/,MF:/^97150$/,PM:/^97500$/,VC:/^[Vv][Cc]\d{4}$/,SM:/^4789\d$/,SA:/^\d{5}(-{1}\d{4})?$/,SN:/^\d{5}$/,RS:/^\d{5}$/,SG:/^\d{2}$/,SK:/^\d{5}\s\(\d{3}\s\d{2}\)$/,SI:/^([Ss][Ii][- ]{0,1}){0,1}\d{4}$/,ZA:/^\d{4}$/,GS:/^[Ss][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,ES:/^\d{5}$/,LK:/^\d{5}$/,SD:/^\d{5}$/,SZ:/^[A-Za-z]\d{3}$/,SE:/^\d{3}\s*\d{2}$/,CH:/^\d{4}$/,SJ:/^\d{4}$/,TW:/^\d{5}$/,TJ:/^\d{6}$/,TH:/^\d{5}$/,TT:/^\d{6}$/,TN:/^\d{4}$/,TR:/^\d{5}$/,TM:/^\d{6}$/,TC:/^[Tt][Kk][Cc][Aa]\s{0,1}[1][Zz]{2}$/,UA:/^\d{5}$/,GB:/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z-[CIKMOV]]{2}/,US:/^\b\d{5}\b(?:[- ]{1}\d{4})?$/,UY:/^\d{5}$/,VI:/^\d{5}$/,UZ:/^\d{3} \d{3}$/,VA:/^120$/,VE:/^\d{4}(\s[a-zA-Z]{1})?$/,VN:/^\d{6}$/,WF:/^986\d{2}$/,ZM:/^\d{5}$/},Be=(t,e="")=>{let r=R(t)&&t.iso?ze[t.iso||"US"]:ze.US;return R(t)?t.rule===!0?!!e.match(r):!e.match(r):t===!0?!!e.match(r):!e.match(r)};var He=(t,e="",r={isChecked:!1})=>{if(!r.isChecked)return t===!0?e&&e.trim()!=="":e&&e.trim()==="";if(r.isChecked)return t===!0?e:!e};var Ze=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,Ge=(t,e="")=>t===!0?!!e.match(Ze):!e.match(Ze);var Ke=/^[a-z0-9]+(?:-[a-z0-9]+)*$/,Je=(t,e="")=>t===!0?!!e.match(Ke):!e.match(Ke);var We=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,Qe=(t,e="")=>t===!0?!!e.match(We):!e.match(We);var Ye=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/,Xe=(t,e="")=>t===!0?!!e.match(Ye):!e.match(Ye);var et={AT:/^(AT)(U\d{8}$)/i,BE:/^(BE)(\d{10}$)/i,BG:/^(BG)(\d{9,10}$)/i,CY:/^(CY)([0-5|9]\d{7}[A-Z]$)/i,CZ:/^(CZ)(\d{8,10})?$/i,DE:/^(DE)([1-9]\d{8}$)/i,DK:/^(DK)(\d{8}$)/i,EE:/^(EE)(10\d{7}$)/i,EL:/^(EL)(\d{9}$)/i,ES:/^(ES)([0-9A-Z][0-9]{7}[0-9A-Z]$)/i,EU:/^(EU)(\d{9}$)/i,FI:/^(FI)(\d{8}$)/i,FR:/^(FR)([0-9A-Z]{2}[0-9]{9}$)/i,GB:/^(GB)((?:[0-9]{12}|[0-9]{9}|(?:GD|HA)[0-9]{3})$)/i,GR:/^(GR)(\d{8,9}$)/i,HR:/^(HR)(\d{11}$)/i,HU:/^(HU)(\d{8}$)/i,IE:/^(IE)([0-9A-Z\*\+]{7}[A-Z]{1,2}$)/i,IT:/^(IT)(\d{11}$)/i,LV:/^(LV)(\d{11}$)/i,LT:/^(LT)(\d{9}$|\d{12}$)/i,LU:/^(LU)(\d{8}$)/i,MT:/^(MT)([1-9]\d{7}$)/i,NL:/^(NL)(\d{9}B\d{2}$)/i,NO:/^(NO)(\d{9}$)/i,PL:/^(PL)(\d{10}$)/i,PT:/^(PT)(\d{9}$)/i,RO:/^(RO)([1-9]\d{1,9}$)/i,RU:/^(RU)(\d{10}$|\d{12}$)/i,RS:/^(RS)(\d{9}$)/i,SI:/^(SI)([1-9]\d{7}$)/i,SK:/^(SK)([1-9]\d[(2-4)|(6-9)]\d{7}$)/i,SE:/^(SE)(\d{10}01$)/i},tt=(t,e="")=>{let r=R(t)&&t.iso?et[t.iso||"EU"]:et.EU;return R(t)?t.rule===!0?!!e.match(r):!e.match(r):t===!0?!!e.match(r):!e.match(r)};var rt={creditCard:De,email:Ie,equals:Pe,matches:_e,maxLength:Ne,minLength:Ve,phone:qe,postalCode:Be,required:He,semVer:Ge,slug:Je,strongPassword:Qe,url:Xe,vat:tt};var ot=class{constructor(e,r={}){this.fieldsToListenToForChanges=["checkbox","color","date","datetime-local","email","file","hidden","month","number","password","radio","range","search","tel","text","time","url","week"],this.defaultValidationErrors={required:()=>"This field is required.",email:()=>"Must be a valid email.",creditCard:()=>"Must be a valid credit card number.",equals:o=>`Value must equal ${o}.`,matches:o=>`Field must match ${o}.`,maxLength:o=>`Field value can be no greater than ${o}.`,minLength:o=>`Field value can be no less than ${o}.`,phone:()=>"Field value must be a valid telephone number.",postalCode:()=>"Field value must be a valid postal code.",semVer:()=>"Field value must be a valid semantic version.",slug:()=>"Field value must be a valid URL slug.",strongPassword:()=>"Field value must be a valid password.",url:()=>"Field value must be a valid URL.",vat:()=>"Field value must be a valid VAT code."},e||console.warn("[validateForm] Must pass an HTML <form></form> element to validate."),this.form=e,this.setOptions(r),this.attachEventListeners()}setOptions(e={}){this.rules=e.rules||{},this.messages=e.messages||{},this.onSubmit=e.onSubmit,this.fields=this.serialize()}updateOptions(e={}){this.setOptions(e)}serialize(){if(this.form)return Object.keys(this.rules).map(r=>{let o=this.form.querySelector(`[name="${r}"]`),n=o?.type;return{listenForChanges:this.fieldsToListenToForChanges.includes(n),type:n,name:r,element:o,validations:Object.entries(this.rules[r]).map(([d,c])=>({name:d,rule:c,valid:!1})).sort((d,c)=>d.name>c.name?1:-1),errorMessages:this.messages[r]?Object.keys(this.messages[r]):{}}})}attachEventListeners(){if(this.form){let e=r=>{r.stopPropagation(),r.preventDefault(),this.validate()&&this.onSubmit&&this.onSubmit()};this.form.removeEventListener("submit",e),this.form.addEventListener("submit",e)}this.fields.forEach(e=>{if(e?.element&&e?.listenForChanges){let r=()=>{Ae(()=>{this.validate(e.name)},100)};e.element.removeEventListener("input",r),e.element.addEventListener("input",r),e.element.removeEventListener("change",r),e.element.addEventListener("change",r)}})}validate(e=null){if(e){this.clearExistingErrors();let r=this.fields.find(o=>o.name===e);return this.validateField(r),this.checkIfValid()}else return this.clearExistingErrors(),this.fields.forEach(r=>{this.validateField(r)}),this.checkIfValid()}checkIfValid(){return!this.fields.map(r=>r.validations.some(o=>!o.valid)).includes(!0)}validateField(e){let r=this.form.querySelector(`[name="${e.name}"]`),o=["checkbox","radio"].includes(e.type),n=o?null:e?.element?.value?.trim(),s=o?e?.element?.checked:null;e.validations.forEach(c=>{if(this.isValidValue(o,o?s:n,c))this.markValidationAsValid(e,c.name);else{let u=this.messages[e.name]&&this.messages[e.name][c.name];this.markValidationAsInvalid(e,c.name),this.renderError(e.element,u||this.defaultValidationErrors[c.name](c.rule,n))}});let d=e.validations.some(c=>!c.valid);return d&&(r.classList.add("error"),r.focus()),d||(r.classList.remove("error"),this.clearExistingError(e.name)),!d}markValidationAsInvalid(e,r){let n=[...e.validations].find(s=>s.name===r);n.valid=!1}markValidationAsValid(e,r){let n=[...e.validations].find(s=>s.name===r);n.valid=!0}isValidValue(e,r,o){let n=rt[o.name];return n?n(o.rule,r,{isChecked:e}):!0}clearExistingErrors(){this.form&&this.form.querySelectorAll(".input-hint.error").forEach(e=>e.remove())}clearExistingError(e=""){let r=document.getElementById(`error-${e}`);r&&r.remove()}renderError(e,r=""){if(e){this.clearExistingError(e.name);let o=document.createElement("p");o.classList.add("input-hint"),o.classList.add("error"),o.setAttribute("id",`error-${e.name}`),o.innerText=r,e.after(o)}}},rr=(t,e)=>new Promise((r,o)=>{try{new ot(t,e).validate()?r():o()}catch(n){console.warn(n)}}),nt=rr;var it=(t={},e={})=>{try{return[...Object.keys(e),...Object.keys(t)].filter((o,n,s)=>s.indexOf(o)===n).reduce((o,n)=>{let s=e[n],d=t[n]||null,c=!he(s)&&!we(s);return o[n]=c?s:d,o},{})}catch(r){i("component.props.compile",r)}};var z=(t={},e={})=>{try{return t&&M(t)?t:t&&l(t)?t(e):""}catch(r){i("component.css.compile",r)}};var or=(t={},e=null)=>{try{let r=e(t);return r&&f(r)&&!A(r)?Object.assign({},r):{}}catch(r){i("component.state.compile.compileState",r)}},B=(t={},e={})=>{try{return l(e)?or(t,e):Object.assign({},e)}catch(r){i("component.state.compile",r)}};var oe={onBeforeMount:()=>null,onMount:()=>null,onBeforeUnmount:()=>null,onUpdateProps:()=>null,onRefetchData:()=>null};var st=(t={},e={})=>{try{return e?Object.entries({...oe,...e||{}}).reduce((r={},[o,n])=>(r[o]=()=>n(t),r),{}):oe}catch(r){i("component.lifecycle.compile",r)}};var at=(t={},e={})=>{try{return Object.entries(e).reduce((r={},[o,n])=>(r[o]=(...s)=>n(...s,t),r),{})}catch{i("component.methods.compile")}};var ne=(t={})=>{try{return{...t,isActive:(e="")=>M(e)&&t?.route!=="*"?e===(typeof location!="undefined"?location.pathname:t.path):!1}}catch(e){i("component.url.compile",e)}};var w=()=>typeof window=="undefined";var L=null,H=0,dt=(t={},e=null)=>{try{let r=t?.url;t?.query&&(r=`${r}?${new URLSearchParams(t.query).toString()}`);let o=new WebSocket(r);L&&(clearInterval(L),L=null);let n={client:o,send:(s={})=>o.send(JSON.stringify(s))};return o.addEventListener("open",()=>{t?.options?.logging&&console.log(`[joystick.websockets] Connected to ${t?.url}`),t?.events?.onOpen&&t.events.onOpen(n),H=0}),o.addEventListener("message",s=>{s?.data&&t?.events?.onMessage&&t.events.onMessage(JSON.parse(s.data||{}),n)}),o.addEventListener("close",s=>{t?.options?.logging&&console.log(`[joystick.websockets] Disconnected from ${t?.url}`),t?.events?.onClose&&t.events.onClose(s?.code,s?.reason,n),o=null;let d=[1e3,1001].includes(s?.code);t?.options?.autoReconnect&&!L&&!d&&(L=setInterval(()=>{o=null,H<(t?.options?.reconnectAttempts||12)?(dt(t,e),t?.options?.logging&&console.log(`[joystick.websockets] Attempting to reconnect (${H+1}/12)...`),H+=1):clearInterval(L)},t?.options?.reconnectDelayInSeconds*1e3||5e3))}),e&&e(n),n}catch(r){i("websockets.client",r)}},ct=dt;var lt=(t={},e={})=>{try{t.options=e||{},t.id=e?._componentId||null,t.instanceId=Ce(8),t.ssrId=e?._ssrId||null,t.css=z(),t.data=q(e?.dataFromSSR,e?._componentId),t.defaultProps=e?.defaultProps||{},t.props=it(e?.defaultProps,e?.existingProps||e?.props),t.state=B(t,e?.existingState||e?.state),t.events=e?.events||{},t.lifecycle=st(t,e?.lifecycle),t.methods=at(t,e?.methods),t.wrapper=e?.wrapper||{},t.translations=e?.translations||{},t.validateForm=nt,t.DOMNode=null,t.dom={},t.dom.virtual={},t.dom.actual={};let r=!w();if(r||(t.url=ne(e?.url)),r&&window.__joystick_url__&&(t.url=ne(window.__joystick_url__)),r&&e?.websockets&&l(e?.websockets)){let o=e.websockets(t),n=f(o)&&Object.entries(o);for(let s=0;s<n?.length;s+=1){let[d,c]=n[s];ct({url:`${window?.process?.env.NODE_ENV==="development"?"ws":"wss"}://${location.host}/api/_websockets/${d}`,options:c?.options||{},query:c?.query||{},events:c?.events||{}},(u={})=>{t.websockets={...t.websockets||{},[d]:u}})}}}catch(r){i("component.registerOptions",r)}};var D=(t="",e=[])=>{try{console.error(`${t} failed with the following errors:`),e.forEach(r=>{console.log(r.message),r.stack&&console.log(r.stack)})}catch(r){i(t,r)}};var Z=(t="{}")=>{try{return JSON.parse(t)}catch(e){i("parseJSON",e)}};var nr=async(t={})=>{try{let e=await t.text();return Z(e)}catch(e){i("api.get.handleParseResponse",e)}},pt=(t="",e={})=>{try{if(typeof window.fetch!="undefined"&&!e?.skip)return new Promise((r,o)=>{let n=e.input?JSON.stringify(e.input):null,s=e.output?JSON.stringify(e.output):null,d=`${window.location.origin}/api/_getters/${t}?input=${n}&output=${s}`;return fetch(d,{method:"GET",mode:"cors",headers:{...e?.headers||{}},credentials:"include"}).then(async c=>{let u=await nr(c);return u?.errors?(D("get request",u.errors),o(u)):r(u)}).catch(c=>(D("get request",[c]),o({errors:[c]})))})}catch(r){i("get request",r)}};var ir=async(t={})=>{try{let e=await t.text();return Z(e)}catch(e){i("api.set.handleParseResponse",e)}},sr=(t={})=>{try{return JSON.stringify(t)}catch(e){i("api.set.getBody",e)}},mt=(t="",e={})=>{try{if(typeof window.fetch!="undefined")return new Promise((r,o)=>{let n=`${window.location.origin}/api/_setters/${t}`,s=sr(e);return fetch(n,{method:"POST",mode:"cors",headers:{...e?.headers||{},"Content-Type":"application/json"},body:s,credentials:"include"}).then(async d=>{let c=await ir(d);return c?.errors?(D("set request",c.errors),o(c)):r(c)}).catch(d=>(D("set request",[d]),o({errors:[d]})))})}catch(r){i("set request",r)}};var ut={get:pt,set:mt};var ar=(t="")=>{try{let[e,r]=t?.split(".");return r?window?.joystick?._internal?.queues[e][r]:window?.joystick?._internal?.queues[e]}catch(e){i("addToQueue.getQueue",e)}},P=(t="",e=null)=>{try{w()||(ar(t)||{}).array.push({callback:e})}catch(r){i("addToQueue",r)}};var G=async(t={},e={},r={},o={})=>{try{if(o?.options?.data&&l(o.options.data)){let n=await o.options.data(t,e,r,o);return Promise.resolve(n)}return Promise.resolve()}catch(n){i("component.data.fetch",n)}};var ft=(t={},e={},r={})=>{try{return{...t,refetch:async(o={})=>{let n=await G(ut,e,o,r);return r.data=ft(n,e,r),window.__joystick_data__[r?.ssrId]=n,r.render({afterRefetchDataRender:()=>{r?.lifecycle?.onRefetchData&&r?.lifecycle?.onRefetchData(r)}}),n}}}catch(o){i("component.data.compile",o)}},ht=ft;var wt=(t={})=>{try{if(!w()&&window.__joystick_data__&&window.__joystick_data__[t?.id]){let e=window.__joystick_data__[t?.id]||{},r=window.__joystick_req__||{};return ht(e,r,t)}return t?.data||{}}catch(e){i("component.loadDataFromWindow",e)}};var dr=(t="")=>{try{let e=document.implementation.createHTMLDocument(""),r=document.createElement("style");return r.textContent=t,e.body.appendChild(r),r.sheet.cssRules}catch(e){i("component.css.prefix.getCSSRules",e)}},ie=(t="",e="")=>{try{let r=dr(t);return Object.entries(r).map(([s,d])=>d).map(s=>{if(s.constructor.name==="CSSStyleRule")return`[js-c="${e}"] ${s.cssText}`;if(s.constructor.name==="CSSMediaRule")return`
          @media ${s.conditionText} {
            ${Object.entries(s.cssRules).map(([d,c])=>`[js-c="${e}"] ${c.cssText}`).join(`
`)}
          }
        `}).join(`
`)}catch(r){i("component.css.prefix",r)}};var yt=(t={})=>{try{if(document.head.querySelector("style[js-ssr]")?.innerText?.includes(t.id))return;let r=t?.options?.css,o=z(r,t),n=btoa(`${o.trim()}`).substring(0,8),s=document.head.querySelector(`style[js-c="${t.id}"]`);if(!s){let d=document.createElement("style");d.setAttribute("js-c",t?.id),d.setAttribute("js-css",n),d.innerHTML=ie(o,t?.id),document.head.appendChild(d)}s&&n!==s.getAttribute("js-css")&&(s.innerHTML=ie(o,t?.id))}catch(e){i("component.css.appendToHead",e)}};var $t=tr(xt());var gt=(t={},e="",r="id")=>{try{let o=t&&t.id;if(f(t)&&o){let n=Object.keys(t);for(let s=0;s<n.length;s+=1){let d=n[s],c=t[d];if(d===r&&c===e)return t;if(d==="children"&&Array.isArray(c))for(let u=0;u<c.length;u+=1){let N=c[u],V=gt(N,e,r);if(V!==null)return V}}}return null}catch(o){i("component.findComponentInTreeByField",o)}},F=gt;var bt=(t="",e={},r=null)=>{let o=F(r||window.joystick._internal.tree,t,"instanceId");o&&(o.children=[...o.children||[],e])};var cr=(t={},e={})=>{try{let r=j(t,{includeActual:!0});return t.dom=r,t.setDOMNodeOnInstance(),t.appendCSSToHead(),e.renderedComponent=t,r.html.wrapped}catch(r){i("component.renderMethods.component.renderForClient",r)}},lr=(t={})=>{try{return t.renderToHTML({ssrTree:t.parent.ssrTree,translations:t.parent.translations,walkingTreeForSSR:t?.parent?.walkingTreeForSSR,dataFromSSR:t.parent?.dataFromSSR}).wrapped}catch(e){i("component.renderMethods.component.renderToHTMLForSSR",e)}},pr=(t={})=>{try{return t.parent.ssrTree.dataFunctions.push(async()=>{let e=await t.options.data(t.parent.options.api,t.parent.options.req);return t.data=e||{},{componentId:t.id,ssrId:t.ssrId,data:e}}),t.renderToHTML({ssrTree:t?.parent?.ssrTree,translations:t?.parent?.translations,walkingTreeForSSR:t?.parent?.walkingTreeForSSR,dataFromSSR:t?.parent?.dataFromSSR})}catch(e){i("component.renderMethods.component.collectDataFunctionsForSSR",e)}},mr=(t={})=>{try{let e={id:t.id,instanceId:t.instanceId,instance:t,children:[]};bt(t.parent.instanceId,e,t.parent&&t.parent.ssrTree||null)}catch(e){i("component.renderMethods.component.handleAddComponentToParent",e)}},ur=(t={},e={})=>{try{!t.renderedComponent&&e.options&&e.options.lifecycle&&(e.options.lifecycle.onBeforeMount&&P("lifecycle.onBeforeMount",()=>{e.options.lifecycle.onBeforeMount(e)}),!t.renderedComponent&&e.options.lifecycle.onMount&&P("lifecycle.onMount",()=>{e.options.lifecycle.onMount(e)}))}catch(r){i("component.renderMethods.component.handleLifecycle",r)}},fr=(t={},e={},r={})=>{try{!e.walkingTreeForSSR&&t?.options?.lifecycle?.onUpdateProps&&(0,$t.diff)(e?.existingPropsMap,r)?.length>0&&P("lifecycle.onUpdateProps",()=>{let n=e?.existingPropsMap&&e?.existingPropsMap[t.id];t.options.lifecycle.onUpdateProps(n||{},r,t)})}catch(o){i("component.renderMethods.component.handleOnChangeProps",o)}},hr=function(){return function(e=null,r={},o={}){let n=e({props:r,existingStateMap:!o.walkingTreeForSSR&&o?.existingStateMap,url:o.url,translations:o.translations,api:o.options.api,req:o.options.req,dataFromSSR:o?.dataFromSSR});return n.parent=o,fr(n,o,r),P("lifecycle.onMount",()=>{n.setDOMNodeOnInstance()}),ur(this,n),mr(n),n.options.data&&n.parent.walkingTreeForSSR&&n.parent.ssrTree.dataFunctions?pr(n):n.parent&&n.parent.ssrTree?lr(n):cr(n,this)}},wr=function(e,r){try{let o=this;return new hr().bind({})(e,r,o)}catch(o){i("component.renderMethods.component",o)}},se=wr;var yr=function(e=[],r=null){try{return l(r)&&e&&Array.isArray(e)?e.map((o,n)=>r(o,n)).join(""):""}catch(o){i("component.renderMethods.each",o)}},ae=yr;var xr=function(e="",r={}){try{let o=w()?this.translations:window.__joystick_i18n__;if(!o||!o[e])return"";let n=Object.entries(r);return n.length>0?n.reduce((s,[d,c])=>s.replace(`{{${d}}}`,c),o[e]):o[e]}catch(o){i("component.renderMethods.i18n",o)}},de=xr;var gr=function(e=!1,r=""){try{return this?.renderingHTMLWithDataForSSR||e?`<when>${r.trim()}</when>`:"<when> </when>"}catch(o){i("component.renderMethods.when",o)}},ce=gr;var Et={c:se,component:se,e:ae,each:ae,i:de,i18n:de,w:ce,when:ce};var Ft=(t={},e={})=>{try{return Object.entries(Et).reduce((r,[o,n])=>(r[o]=n.bind({...t,...e}),r),{})}catch(r){i("component.renderMethods.compile",r)}};var St=(t={})=>{try{let e={},r=F(window.joystick._internal.tree,t.instanceId);return r&&(e[r?.instance?.instanceId]=r?.instance?.props),r?.children?.reduce((o={},n)=>(o[n?.instance?.instanceId]||(o[n?.instance?.instanceId]=n?.instance?.props),o),e)}catch(e){i("component.render.getExistingPropsMap",e)}};var kt=(t={})=>{try{let e={},r=F(window.joystick._internal.tree,t.instanceId);return r&&(e[r?.instance?.instanceId]=r?.instance?.state),r?.children?.reduce((o={},n)=>(o[n?.instance?.instanceId]||(o[n?.instance?.instanceId]=n?.instance?.state),o),e)}catch(e){i("component.render.getExistingStateMap",e)}};var Mt=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),br=new RegExp(/\n/g);var $r=(t="")=>{try{return(t.match(Mt)||[]).forEach(r=>{t=t.replace(r,"")}),t}catch(e){i("component.render.sanitizeHTML.removeCommentedCode",e)}},Tt=(t="")=>{try{let e=`${t}`;return e=$r(e),e}catch(e){i("component.render.sanitizeHTML",e)}};var vt=(t={},e="")=>{try{let{wrapper:r=null,ssrId:o=null,id:n=null,instanceId:s=null}=t;return`<div ${r?.id?`id="${r.id}" `:""}${r?.classList?`class="${r.classList?.join(" ")}" `:""}js-ssrId="${o}" js-c="${n}" js-i="${s}">${e}</div>`}catch(r){i("component.render.wrapHTML",r)}};var J=(t={},e={})=>{try{e?.dataFromSSR&&(t.data=q(e.dataFromSSR,t.id)||{});let r={...t,getExistingPropsMap:{},existingPropsMap:w()?{}:St(t),existingStateMap:w()?{}:kt(t),ssrTree:e?.ssrTree,translations:e?.translations||t.translations||{},walkingTreeForSSR:e?.walkingTreeForSSR,renderingHTMLWithDataForSSR:e?.renderingHTMLWithDataForSSR,dataFromSSR:e?.dataFromSSR},o=Ft(r),n=t.options.render({...t||{},setState:t.setState.bind(t),...o||{}}),s=Tt(n),d=vt(t,s);return{unwrapped:s,wrapped:d}}catch(r){i("component.render.toHTML",r)}};var Er=(t={})=>{try{return Object.values(t).reduce((e={},r)=>(e[r.name]=r.value,e),{})}catch(e){i("component.virtualDOM.build.parseAttributeMap",e)}},Ot=(t={})=>{try{return t.tagName==="WHEN"?[].flatMap.call(t?.childNodes,e=>e?.tagName==="WHEN"?Ot(e):le(e)):le(t)}catch(e){i("component.virtualDOM.build.flattenWhenTags",e)}},le=(t={})=>{try{let e=t&&t.tagName&&t.tagName.toLowerCase()||"text",r={tagName:e,attributes:Er(t.attributes),children:[].flatMap.call(t.childNodes,o=>Ot(o))};return e==="text"&&(r=t.textContent),r}catch(e){i("component.virtualDOM.build",e)}},W=le;var Fr=(t="",e="")=>{try{let r=document.createElement("div");return r.setAttribute("js-c",e),r.innerHTML=t,r}catch(r){i("component.virtualDOM.build.convertHTMLToDOM",r)}},Ct=(t="",e="")=>{try{let r=Fr(t,e);return W(r)}catch(r){i("component.virtualDOM.build",r)}};var At=(t="")=>{try{return document.createElement("div").setAttribute(t,"Test"),!0}catch{return!1}};var Sr=(t={})=>{try{let e=document.createElement(t.tagName),r=Object.entries(t.attributes);for(let o=0;o<r.length;o+=1){let[n,s]=r[o];At(n)&&e.setAttribute(n,s)}for(let o=0;o<t?.children?.length;o+=1){let n=t?.children[o];if(n){let s=Rt(n);e.appendChild(s)}}return e}catch(e){i("component.virtualDOM.renderTreeToDOM.renderElement",e)}},Rt=(t=null)=>{try{return M(t)?document.createTextNode(t):Sr(t)}catch(e){i("component.virtualDOM.renderTreeToDOM",e)}},I=Rt;var j=(t={},e={})=>{try{let r=J(t),o=Ct(r.unwrapped,t.id),n=e.includeActual&&o?I(o):null;return{html:r,virtual:o,actual:n}}catch(r){i("component.render.getUpdatedDOM",r)}};var Lt=(t={})=>{try{let e=j(t,{includeActual:!0});return t.dom=e,e.actual}catch(e){i("component.render.forMount",e)}};var kr=(t={},e={})=>{let r=[];for(let[o,n]of Object.entries(e))r.push(s=>(s&&s.setAttribute&&s.setAttribute(o,n),s));for(let o in t)o in e||r.push(n=>(n&&n.removeAttribute&&n.removeAttribute(o),n));return o=>{for(let n of r)n&&typeof n=="function"&&n(o)}},Q=kr;var Mr=(t=[],e=[])=>{let r=[],o=Math.max(t.length,e.length);for(let n=0;n<o;n+=1){let s=t[n],d=e[n];r.push([s,d])}return r},Dt=Mr;var Tr=(t=[],e)=>{t.forEach(r=>{r&&typeof r=="function"&&r(e)})},vr=(t=[])=>{t.forEach(([e,r])=>{e&&typeof e=="function"&&e(r)})},Or=(t=[],e=[])=>{let r=[];return e.slice(t.length).forEach(n=>{let s=d=>{let c=I(n);return d.appendChild(c),d};r.push(s)}),r},Cr=(t=[],e=[])=>{let r=[];return t.forEach((o,n)=>{let s=X(o,e[n]);r.push(s)}),r},Ar=(t=[],e=[])=>{let r=Cr(t,e),o=Or(t,e);return n=>{if(n){let s=Dt(r,n.childNodes);vr(s),Tr(o,n)}return n}},Y=Ar;var jt={select:(t,e)=>r=>{let o=r.value;r.replaceChildren(),Q(t.attributes,e.attributes)(r),Y([],e.children)(r);let n=r.querySelector(`option[value="${o}"]`);if(n&&(r.value=o),!n){let s=r.querySelector("option");r.value=s?.value||""}return r}};var pe=(t,e)=>r=>{let o=t?I(t):null;return r&&r.replaceWith(o),o},Rr=()=>t=>{t&&t.remove()},Lr=(t=void 0,e=void 0)=>t===void 0||e===void 0?Rr():typeof t=="string"||typeof e=="string"?pe(e,t):t.tagName!==e.tagName?pe(e):e.tagName==="select"?jt.select(t,e):["pre","code"].includes(e.tagName)?pe(e,t):n=>(Q(t.attributes,e.attributes)(n),Y(t.children,e.children)(n),n),X=Lr;var Dr=(t="")=>{try{let[e,r]=t?.split(".");return r?window?.joystick?._internal?.queues[e][r]:window?.joystick?._internal?.queues[e]}catch(e){i("processQueue.getQueue",e)}},_=(t="",e=null)=>{try{w()||(Dr(t)||{}).process(e)}catch(r){i("processQueue",r)}};var It=(t="",e=null)=>{let r=F(e||window.joystick._internal.tree,t,"instanceId");r&&(r.children=[])};var Pt=(t="",e={},r=null)=>{let o=F(r||window.joystick._internal.tree,t,"instanceId");o&&(o.instanceId=e?.instanceId,o.instance=e)};var _t=()=>{setTimeout(()=>{let t=window.joystick._internal.eventListeners;for(let e=0;e<t?.length;e+=1){let r=t[e];for(let o=0;o<r?.events?.length;o+=1){let n=r.events[o];for(let s=0;s<n?.elements?.length;s+=1)n.elements[s].removeEventListener(n.type,n.eventListener)}}},0)};var Nt=(t={})=>{try{return Object.entries(t).map(([e,r])=>{let[o,...n]=e.split(" ");return{type:o.toLowerCase(),selector:n.join(" "),handler:r}})}catch(e){i("component.events.serialize",e)}};var jr=(t={})=>{try{if(t.lifecycle&&t.lifecycle.onBeforeUnmount&&l(t.lifecycle.onBeforeUnmount)){let e=function(){t.lifecycle.onBeforeUnmount(t)};window.removeEventListener("beforeunload",e),window.addEventListener("beforeunload",e)}}catch(e){i("component.events.registerListeners.attachOnBeforeUnmount",e)}},Vt=(t={},e=[])=>{let r=t.instance.options.events||{},o=Object.keys(r).length>0;if(jr(t.instance),o&&e.push({id:t.id,instanceId:t.instance.instanceId,events:Nt(r).map(n=>{let s=document.querySelectorAll(`body [js-i="${t.instance.instanceId}"] ${n.selector}`),d=document.querySelectorAll(`body [js-c="${t.id}"] ${n.selector}`);return{...n,eventListener:function(u){Object.defineProperty(u,"target",{value:u.composedPath()[0]}),n.handler(u,t.instance)},elements:s?.length>0?s:[]}}),instance:t.instance}),t?.children?.length>0)for(let n=0;n<t?.children?.length;n+=1){let s=t?.children[n];Vt(s,e)}return e},Ut=()=>{setTimeout(()=>{let t=Vt(window.joystick._internal.tree,[]);for(let e=0;e<t?.length;e+=1){let r=t[e];for(let o=0;o<r?.events?.length;o+=1){let n=r.events[o];for(let s=0;s<n?.elements?.length;s+=1)n.elements[s].addEventListener(n.type,n.eventListener)}}window.joystick._internal.eventListeners=t},0)};var qt=(t={},e="",r={})=>{for(let o=0;o<t?.children?.length;o+=1){let n=t?.children[o];if(f(n)&&n.attributes&&n.attributes["js-i"]&&n.attributes["js-i"]===e){t.children[o]=r;break}f(n)&&qt(n,e,r)}},zt=qt;var Bt=class{constructor(e={}){ve(e),lt(this,e),this.data=wt(this),this.onUpdateChildComponent=this.handleUpdateChildComponentInVDOM}setDOMNodeOnInstance(){this.DOMNode=document.querySelector(`body [js-i="${this.instanceId}"]`)}appendCSSToHead(){yt(this)}async handleFetchData(e={},r={},o={},n=this){let s=await G(e,r,o,n);return this.data=s,s}handleGetInstance(){return this}onBeforeRender(){if(!w())return{instanceId:this.instanceId}}render(e={}){if(e?.mounting)return Lt(this);let r=this.onBeforeRender();_t(),It(this.instanceId);let o=j(this,{}),n=X(this.dom.virtual,o.virtual);Ut(),n&&l(n)&&_("lifecycle.onBeforeMount",()=>{let s=n(this.DOMNode);this.dom.actual=s,this.dom.virtual=o.virtual,_("lifecycle.onMount",()=>{this.onAfterRender(r,e)})})}renderToHTML(e={}){return J(this,e)}onAfterRender(e={},r={}){w()||(this.setDOMNodeOnInstance(),Pt(e.instanceId,this),this.appendCSSToHead(),_("domNodes"),_("lifecycle.onUpdateProps"),r?.afterSetStateRender&&l(r.afterSetStateRender)&&r.afterSetStateRender(),r?.afterRefetchDataRender&&l(r.afterRefetchDataRender)&&r.afterRefetchDataRender(),this.parent&&this.parent.onUpdateChildComponent(this.id,this.instanceId))}setState(e={},r=null){this.state=B(this,{...this.state||{},...e}),this.render({afterSetStateRender:()=>{r&&l(r)&&r()}})}handleUpdateChildComponentInVDOM(e="",r=""){let o=F(window.joystick._internal.tree,this.instanceId,"instanceId"),n=F(window.joystick._internal.tree,r,"instanceId");if(n?.instance?.DOMNode){let s=W(n?.instance?.DOMNode);zt(o?.instance?.dom?.virtual,n?.instanceId,s)}}},Ht=Bt;var rd=(t={})=>{try{return(e={})=>new Ht({...t,existingProps:e?.existingProps&&e?.existingProps[t?.id],existingState:e?.existingStateMap&&e?.existingStateMap[t?.id],props:e?.props,url:e?.url,translations:e?.translations,api:e?.api,req:e?.req})}catch(e){i("component",e)}};export{rd as default};
