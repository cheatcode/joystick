var mr=Object.create;var v=Object.defineProperty;var wr=Object.getOwnPropertyDescriptor;var yr=Object.getOwnPropertyNames;var xr=Object.getPrototypeOf,Mr=Object.prototype.hasOwnProperty;var Tr=r=>v(r,"__esModule",{value:!0});var gr=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var Fr=(r,e,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of yr(e))!Mr.call(r,o)&&o!=="default"&&v(r,o,{get:()=>e[o],enumerable:!(t=wr(e,o))||t.enumerable});return r},Sr=r=>Fr(Tr(v(r!=null?mr(xr(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);var U=gr(R=>{(function(r,e){if(typeof define=="function"&&define.amd)define(["exports"],e);else if(typeof R!="undefined")e(R);else{var t={exports:{}};e(t.exports),r.index=t.exports}})(R,function(r){"use strict";function e(a){return e=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(c){return typeof c}:function(c){return c&&typeof Symbol=="function"&&c.constructor===Symbol&&c!==Symbol.prototype?"symbol":typeof c},e(a)}function t(a,c){return c&&(e(c)==="object"||typeof c=="function")?c:o(a)}function o(a){if(a===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function n(a){return n=Object.setPrototypeOf?Object.getPrototypeOf:function(c){return c.__proto__||Object.getPrototypeOf(c)},n(a)}function s(a,c){if(typeof c!="function"&&c!==null)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(c&&c.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),c&&m(a,c)}function m(a,c){return m=Object.setPrototypeOf||function(p,T){return p.__proto__=T,p},m(a,c)}function l(a,c){if(!(a instanceof c))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0}),r.diff=void 0;var M=function a(c,p){l(this,a),this.type=c,this.path=p?p.toString():""},k=function(a){function c(p,T,d){var F;return l(this,c),F=t(this,n(c).call(this,"E",p)),F.lhs=T,F.rhs=d,F}return s(c,a),c}(M),C=function(a){function c(p,T,d,F){var f;return l(this,c),f=t(this,n(c).call(this,"M",p)),f.item=T,f.lhsIndex=d,f.rhsIndex=F,f}return s(c,a),c}(M),L=function(a){function c(p,T){var d;return l(this,c),d=t(this,n(c).call(this,"D",p)),d.lhs=T,d}return s(c,a),c}(M),A=function(a){function c(p,T){var d;return l(this,c),d=t(this,n(c).call(this,"A",p)),d.rhs=T,d}return s(c,a),c}(M),b=function(a,c){return a?"".concat(a,".").concat(c):c};r.diff=function(c,p){var T=2<arguments.length&&arguments[2]!==void 0?arguments[2]:{},d=[],F=T.matchKey,f=T.types||["E","A","D","M"],hr=function(h,u,w,O){h.forEach(function(S,y){var g=u.findIndex(function(x){return x[O]===S[O]});-1<g?(-1<f.indexOf("M")&&y!==g&&d.push(new C(w,S,y,g)),j(S,u[g],b(w,g))):-1<f.indexOf("D")&&d.push(new L(w,S))}),u.forEach(function(S,y){var g=h.findIndex(function(x){return S[O]===x[O]});-1<f.indexOf("A")&&g===-1&&d.push(new A(b(w,y),S))})},j=function(h,u,w){var O=Object.prototype.toString.call(h),S=Object.prototype.toString.call(u);if(-1<f.indexOf("E")&&O!==S)return d.push(new k(w,h,u)),!1;if(O==="[object Object]")Object.getOwnPropertyNames(h).forEach(function(x){Object.prototype.hasOwnProperty.call(u,x)?j(h[x],u[x],b(w,x)):-1<f.indexOf("D")&&d.push(new L(b(w,x),h[x]))}),Object.getOwnPropertyNames(u).forEach(function(x){-1<f.indexOf("A")&&!Object.prototype.hasOwnProperty.call(h,x)&&d.push(new A(b(w,x),u[x]))});else if(O!=="[object Array]")-1<f.indexOf("E")&&h!==u&&d.push(new k(w,h,u));else if(F)hr(h,u,w,F);else{var y=h.length-1,g=u.length-1;if(-1<f.indexOf("D"))for(;y>g;)d.push(new L(b(w,y),h[y--]));if(-1<f.indexOf("A"))for(;g>y;)d.push(new A(b(w,g),u[g--]));for(;0<=y;--y)j(h[y],u[y],b(w,y))}};return j(c,p),d}})});var fr=Sr(U());var i=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var D=()=>typeof window=="undefined";var br=(r="")=>{try{let[e,t]=r?.split(".");return t?window?.joystick?._internal?.queues[e][t]:window?.joystick?._internal?.queues[e]}catch(e){i("addToQueue.getQueue",e)}},E=(r="",e=null)=>{try{D()||(br(r)||{}).array.push({callback:e})}catch(t){i("addToQueue",t)}};var $=r=>{try{return!!Array.isArray(r)}catch(e){i("types.isArray",e)}};var q=r=>{try{return typeof r=="function"}catch(e){i("types.isFunction",e)}};var B=r=>{try{return!!(r&&typeof r=="object"&&!Array.isArray(r))}catch(e){i("types.isObject",e)}};var W=r=>{try{return typeof r=="string"}catch(e){i("types.isString",e)}};var z=(r=[],e="")=>{try{return($(r)&&r.find(o=>o?.componentId===e))?.data||{}}catch(t){i("findComponentDataFromSSR",t)}};var G=(r={},e={})=>{try{return Object.entries(Q).reduce((t,[o,n])=>(t[o]=n.bind({...r,...e}),t),{})}catch(t){i("component.renderMethods.compile",t)}};var V=(r={},e={})=>{try{return Object.entries(e).reduce((t={},[o,n])=>(t[o]=(...s)=>n(...s,{...r,setState:r.setState.bind(r),...r.renderMethods||{}}),t),{})}catch{i("component.methods.compile")}};var K=(r={})=>{try{return Object.entries(r)?.reduce((e={},[t,o]={})=>(e[t]=o?.map((n={})=>({state:n?.state,children:K(n?.children)})),e),{})}catch(e){i("component.render.getExistingStateMap.buildMapForChildren",e)}},X=(r={})=>{try{return K(r)}catch(e){i("component.render.getExistingStateMap",e)}};var J=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),Or=new RegExp(/\n/g);var Er=(r="")=>{try{return(r.match(J)||[]).forEach(t=>{r=r.replace(t,"")}),r}catch(e){i("component.render.sanitizeHTML.removeCommentedCode",e)}},Y=(r="")=>{try{let e=`${r}`;return e=Er(e),e}catch(e){i("component.render.sanitizeHTML",e)}};var Z=(r={},e="")=>{try{let{wrapper:t=null,ssrId:o=null,id:n=null,instanceId:s=null}=r;return`<div ${t?.id?`id="${t.id}" `:""}${t?.classList?`class="${t.classList?.join(" ")}" `:""}js-ssrId="${o}" js-c="${n}" js-i="${s}">${e}</div>`}catch(t){i("component.render.wrapHTML",t)}};var rr=(r={},e=[])=>{try{let t=[...e],o=Object.entries(r);for(let n=0;n<o?.length;n+=1){let[s,m]=o[n];for(let l=0;l<m?.length;l+=1){let M=m[l];Object.entries(M?.timers)?.length>0&&t.push(...Object.values(M?.timers)),Object.entries(M?.children)?.length>0&&rr(M?.children,t)}}if(t?.length>0)for(let n=0;n<t?.length;n+=1)clearTimeout(t[n])}catch(t){i("component.render.clearTimersOnChildren",t)}},er=rr;var tr=(r={},e={})=>{try{e?.dataFromSSR&&(r.data=z(e.dataFromSSR,r.id)||{}),er(r?.children);let t=X(e?.existingChildren||r?.children)||{};r.children={},r.renderMethods=G({...r,existingStateMap:t,translations:e?.translations||r.translations||{},ssrTree:e?.ssrTree,walkingTreeForSSR:e?.walkingTreeForSSR,renderingHTMLWithDataForSSR:e?.renderingHTMLWithDataForSSR,dataFromSSR:e?.dataFromSSR}),r.methods=V(r,r.options.methods);let o=r.options.render({...r||{},setState:r.setState.bind(r),...r.renderMethods||{}}),n=Y(o),s=Z(r,n);return{unwrapped:n,wrapped:s}}catch(t){i("component.render.toHTML",t)}};var kr=(r={})=>{try{return Object.values(r).reduce((e={},t)=>(e[t.name]=t.value,e),{})}catch(e){i("component.virtualDOM.build.parseAttributeMap",e)}},or=(r={})=>{try{return r.tagName==="WHEN"?[].flatMap.call(r?.childNodes,e=>e?.tagName==="WHEN"?or(e):H(e)):H(r)}catch(e){i("component.virtualDOM.build.flattenWhenTags",e)}},H=(r={})=>{try{let e=r&&r.tagName&&r.tagName.toLowerCase()||"text",t={tagName:e,attributes:kr(r.attributes),children:[].flatMap.call(r.childNodes,o=>or(o))};return e==="text"&&(t=r.textContent),t}catch(e){i("component.virtualDOM.build",e)}},nr=H;var Cr=(r="")=>{try{let e=document.createElement("div");return e.innerHTML=r,e?.childNodes[0]}catch(e){i("component.virtualDOM.build.convertHTMLToDOM",e)}},ir=(r="")=>{try{let e=Cr(r);return nr(e)}catch(e){i("component.virtualDOM.build",e)}};var cr=(r="")=>{try{return document.createElement("div").setAttribute(r,"Test"),!0}catch{return!1}};var jr=(r={})=>{try{let e=document.createElement(r.tagName),t=Object.entries(r.attributes);for(let o=0;o<t.length;o+=1){let[n,s]=t[o];cr(n)&&e.setAttribute(n,s)}for(let o=0;o<r?.children?.length;o+=1){let n=r?.children[o];if(n){let s=ar(n);e.appendChild(s)}}return e}catch(e){i("component.virtualDOM.renderTreeToDOM.renderElement",e)}},ar=(r=null)=>{try{return W(r)?document.createTextNode(r):jr(r)}catch(e){i("component.virtualDOM.renderTreeToDOM",e)}},sr=ar;var dr=(r={},e={})=>{try{let t=tr(r,{existingChildren:e?.existingChildren}),o=ir(t.wrapped,r),n=e.includeActual&&o?sr(o):null;return{html:t,virtual:o,actual:n}}catch(t){i("component.render.getUpdatedDOM",t)}};var lr=(r={},e="",t="id")=>{try{let o=r&&r.id;if(B(r)&&o){let n=Object.keys(r);for(let s=0;s<n.length;s+=1){let m=n[s],l=r[m];if(m===t&&l===e)return r;if(m==="children"&&Array.isArray(l))for(let M=0;M<l.length;M+=1){let k=l[M],C=lr(k,e,t);if(C!==null)return C}}}return null}catch(o){i("component.findComponentInTreeByField",o)}},ur=lr;var pr=(r="",e={},t=null)=>{let o=ur(t||window.joystick._internal.tree,r,"instanceId");o&&(o.children=[...o.children||[],e])};var Rr=(r={},e={},t=null)=>{try{let o=dr(r,{includeActual:!0,existingChildren:t});return r.dom=o,r.setDOMNodeOnInstance(),r.appendCSSToHead(),e.renderedComponent=r,o.html.wrapped}catch(o){i("component.renderMethods.component.renderForClient",o)}},Dr=(r={})=>{try{return r.renderToHTML({ssrTree:r.parent.ssrTree,translations:r.parent.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r.parent?.dataFromSSR}).wrapped}catch(e){i("component.renderMethods.component.renderToHTMLForSSR",e)}},Lr=(r={})=>{try{return r.parent.ssrTree.dataFunctions.push(async()=>{let e=await r.options.data(r.parent.options.api,r.parent.options.req);return r.data=e||{},{componentId:r.id,ssrId:r.ssrId,data:e}}),r.renderToHTML({ssrTree:r?.parent?.ssrTree,translations:r?.parent?.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r?.parent?.dataFromSSR})}catch(e){i("component.renderMethods.component.collectDataFunctionsForSSR",e)}},Ar=(r={})=>{try{let e={id:r.id,instanceId:r.instanceId,instance:r,children:[]};pr(r.parent.instanceId,e,r.parent&&r.parent.ssrTree||null)}catch(e){i("component.renderMethods.component.handleAddComponentToParent",e)}},vr=(r={},e={})=>{try{!r.renderedComponent&&e.options&&e.options.lifecycle&&(e.options.lifecycle.onBeforeMount&&E("lifecycle.onBeforeMount",()=>{e.options.lifecycle.onBeforeMount(e)}),!r.renderedComponent&&e.options.lifecycle.onMount&&E("lifecycle.onMount",()=>{e.options.lifecycle.onMount(e)}))}catch(t){i("component.renderMethods.component.handleLifecycle",t)}},Hr=(r={},e={},t={})=>{try{!e.walkingTreeForSSR&&r?.options?.lifecycle?.onUpdateProps&&(0,fr.diff)(e?.existingPropsMap,t)?.length>0&&E("lifecycle.onUpdateProps",()=>{let n=e?.existingPropsMap&&e?.existingPropsMap[r.id];r.options.lifecycle.onUpdateProps(n||{},t,r)})}catch(o){i("component.renderMethods.component.handleOnChangeProps",o)}},Nr=function(){return function(e=null,t={},o={}){let n=e({props:t,url:o.url,translations:o.translations,api:o.options.api,req:o.options.req,dataFromSSR:o?.dataFromSSR,parent:o}),s=o?.existingStateMap[n.id]||{},m=o.children[n.id]||[],l=s[m?.length];return n.state=l?.state||n.state,o.children[n.id]=[...o.children[n.id]||[],n],n.parent=o,Hr(n,o,t),E("lifecycle.onMount",()=>{n.setDOMNodeOnInstance()}),vr(this,n),n.parent&&Ar(n),n.options.data&&n.parent.walkingTreeForSSR&&n.parent.ssrTree.dataFunctions?Lr(n):n.parent&&n.parent.ssrTree?Dr(n):Rr(n,this,l?.children)}},Pr=function(e,t){try{let o=this;return new Nr().bind({})(e,t,o)}catch(o){i("component.renderMethods.component",o)}},N=Pr;var _r=function(e=[],t=null){try{return q(t)&&e&&Array.isArray(e)?e.map((o,n)=>t(o,n)).join(""):""}catch(o){i("component.renderMethods.each",o)}},P=_r;var Ir=function(e="",t={}){try{let o=D()?this.translations:window.__joystick_i18n__;if(!o||!o[e])return"";let n=Object.entries(t);return n.length>0?n.reduce((s,[m,l])=>s.replace(`{{${m}}}`,l),o[e]):o[e]}catch(o){i("component.renderMethods.i18n",o)}},_=Ir;var Ur=function(e=!1,t=""){try{return this?.renderingHTMLWithDataForSSR||e?`<when>${t.trim()}</when>`:"<when> </when>"}catch(o){i("component.renderMethods.when",o)}},I=Ur;var Q={c:N,component:N,e:P,each:P,i:_,i18n:_,w:I,when:I};export{Q as default};
