var Mr=Object.create;var P=Object.defineProperty;var gr=Object.getOwnPropertyDescriptor;var Tr=Object.getOwnPropertyNames;var Fr=Object.getPrototypeOf,Sr=Object.prototype.hasOwnProperty;var Or=r=>P(r,"__esModule",{value:!0});var br=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var Er=(r,e,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Tr(e))!Sr.call(r,n)&&n!=="default"&&P(r,n,{get:()=>e[n],enumerable:!(t=gr(e,n))||t.enumerable});return r},kr=r=>Er(Or(P(r!=null?Mr(Fr(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);var B=br(L=>{(function(r,e){if(typeof define=="function"&&define.amd)define(["exports"],e);else if(typeof L!="undefined")e(L);else{var t={exports:{}};e(t.exports),r.index=t.exports}})(L,function(r){"use strict";function e(c){return e=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(a){return typeof a}:function(a){return a&&typeof Symbol=="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},e(c)}function t(c,a){return a&&(e(a)==="object"||typeof a=="function")?a:n(c)}function n(c){if(c===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return c}function o(c){return o=Object.setPrototypeOf?Object.getPrototypeOf:function(a){return a.__proto__||Object.getPrototypeOf(a)},o(c)}function s(c,a){if(typeof a!="function"&&a!==null)throw new TypeError("Super expression must either be null or a function");c.prototype=Object.create(a&&a.prototype,{constructor:{value:c,writable:!0,configurable:!0}}),a&&m(c,a)}function m(c,a){return m=Object.setPrototypeOf||function(p,g){return p.__proto__=g,p},m(c,a)}function l(c,a){if(!(c instanceof a))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0}),r.diff=void 0;var M=function c(a,p){l(this,c),this.type=a,this.path=p?p.toString():""},j=function(c){function a(p,g,d){var F;return l(this,a),F=t(this,o(a).call(this,"E",p)),F.lhs=g,F.rhs=d,F}return s(a,c),a}(M),R=function(c){function a(p,g,d,F){var f;return l(this,a),f=t(this,o(a).call(this,"M",p)),f.item=g,f.lhsIndex=d,f.rhsIndex=F,f}return s(a,c),a}(M),A=function(c){function a(p,g){var d;return l(this,a),d=t(this,o(a).call(this,"D",p)),d.lhs=g,d}return s(a,c),a}(M),N=function(c){function a(p,g){var d;return l(this,a),d=t(this,o(a).call(this,"A",p)),d.rhs=g,d}return s(a,c),a}(M),O=function(c,a){return c?"".concat(c,".").concat(a):a};r.diff=function(a,p){var g=2<arguments.length&&arguments[2]!==void 0?arguments[2]:{},d=[],F=g.matchKey,f=g.types||["E","A","D","M"],xr=function(h,u,w,b){h.forEach(function(S,y){var T=u.findIndex(function(x){return x[b]===S[b]});-1<T?(-1<f.indexOf("M")&&y!==T&&d.push(new R(w,S,y,T)),D(S,u[T],O(w,T))):-1<f.indexOf("D")&&d.push(new A(w,S))}),u.forEach(function(S,y){var T=h.findIndex(function(x){return S[b]===x[b]});-1<f.indexOf("A")&&T===-1&&d.push(new N(O(w,y),S))})},D=function(h,u,w){var b=Object.prototype.toString.call(h),S=Object.prototype.toString.call(u);if(-1<f.indexOf("E")&&b!==S)return d.push(new j(w,h,u)),!1;if(b==="[object Object]")Object.getOwnPropertyNames(h).forEach(function(x){Object.prototype.hasOwnProperty.call(u,x)?D(h[x],u[x],O(w,x)):-1<f.indexOf("D")&&d.push(new A(O(w,x),h[x]))}),Object.getOwnPropertyNames(u).forEach(function(x){-1<f.indexOf("A")&&!Object.prototype.hasOwnProperty.call(h,x)&&d.push(new N(O(w,x),u[x]))});else if(b!=="[object Array]")-1<f.indexOf("E")&&h!==u&&d.push(new j(w,h,u));else if(F)xr(h,u,w,F);else{var y=h.length-1,T=u.length-1;if(-1<f.indexOf("D"))for(;y>T;)d.push(new A(O(w,y),h[y--]));if(-1<f.indexOf("A"))for(;T>y;)d.push(new N(O(w,T),u[T--]));for(;0<=y;--y)D(h[y],u[y],O(w,y))}};return D(a,p),d}})});var yr=kr(B());var i=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var v=()=>typeof window=="undefined";var Cr=(r="")=>{try{let[e,t]=r?.split(".");return t?window?.joystick?._internal?.queues[e][t]:window?.joystick?._internal?.queues[e]}catch(e){i("addToQueue.getQueue",e)}},C=(r="",e=null)=>{try{v()||(Cr(r)||{}).array.push({callback:e})}catch(t){i("addToQueue",t)}};var W=r=>{try{return!!Array.isArray(r)}catch(e){i("types.isArray",e)}};var z=r=>{try{return typeof r=="function"}catch(e){i("types.isFunction",e)}};var G=r=>{try{return!!(r&&typeof r=="object"&&!Array.isArray(r))}catch(e){i("types.isObject",e)}};var Q=r=>{try{return typeof r=="string"}catch(e){i("types.isString",e)}};var V=(r=[],e="")=>{try{return(W(r)&&r.find(n=>n?.componentId===e))?.data||{}}catch(t){i("findComponentDataFromSSR",t)}};var K=(r={},e={})=>{try{return Object.entries(X).reduce((t,[n,o])=>(t[n]=o.bind({...r,...e}),t),{})}catch(t){i("component.renderMethods.compile",t)}};var J="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890".split(""),E=(r=16)=>{let e="",t=0;for(;t<r;)e+=J[Math.floor(Math.random()*(J.length-1))],t+=1;return e};var k=(r="",e=[])=>{typeof window!="undefined"&&!!window.__joystick_test__&&(window.test={...window.test||{},functionCalls:{...window?.test?.functionCalls||{},[r]:[...window?.test?.functionCalls&&window?.test?.functionCalls[r]||[],{calledAt:new Date().toISOString(),args:e}]}})};var Y=(r={},e={})=>{try{return Object.entries(e).reduce((t={},[n,o])=>(t[n]=(...s)=>(k(`ui.${r?.options?.test?.name||E()}.methods.${n}`,[...s,{...r,setState:r.setState.bind(r),...r.renderMethods||{}}]),o(...s,{...r,setState:r.setState.bind(r),...r.renderMethods||{}})),t),{})}catch{i("component.methods.compile")}};var Z=(r={})=>{try{return Object.entries(r)?.reduce((e={},[t,n]={})=>(e[t]=n?.map((o={})=>({state:o?.state,values:o?.values,children:Z(o?.children)})),e),{})}catch(e){i("component.render.getExistingStateMap.buildMapForChildren",e)}},rr=(r={})=>{try{return Z(r)}catch(e){i("component.render.getExistingStateMap",e)}};var er=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),jr=new RegExp(/\n/g);var Rr=(r="")=>{try{return(r.match(er)||[]).forEach(t=>{r=r.replace(t,"")}),r}catch(e){i("component.render.sanitizeHTML.removeCommentedCode",e)}},tr=(r="")=>{try{let e=`${r}`;return e=Rr(e),e}catch(e){i("component.render.sanitizeHTML",e)}};var nr=(r={},e="")=>{try{let{wrapper:t=null,id:n=null,instanceId:o=null}=r;return`<div ${t?.id?`id="${t.id}" `:""}${t?.classList?`class="${t.classList?.join(" ")}" `:""} js-c="${n}" js-i="${o}">${e}</div>`}catch(t){i("component.render.wrapHTML",t)}};var or=(r={},e=[])=>{try{let t=[...e],n=Object.entries(r);for(let o=0;o<n?.length;o+=1){let[s,m]=n[o];for(let l=0;l<m?.length;l+=1){let M=m[l];Object.entries(M?.timers)?.length>0&&t.push(...Object.values(M?.timers)),Object.entries(M?.children)?.length>0&&or(M?.children,t)}}if(t?.length>0)for(let o=0;o<t?.length;o+=1)clearTimeout(t[o])}catch(t){i("component.render.clearTimersOnChildren",t)}},ir=or;var ar=(r={},e={})=>{try{e?.dataFromSSR&&(r.data=V(e.dataFromSSR,r.id)||{}),ir(r?.children);let t=rr(e?.existingChildren||r?.children)||{};r.children={},r.renderMethods=K({...r,existingStateMap:t,translations:e?.translations||r.translations||{},ssrTree:e?.ssrTree,walkingTreeForSSR:e?.walkingTreeForSSR,renderingHTMLWithDataForSSR:e?.renderingHTMLWithDataForSSR,dataFromSSR:e?.dataFromSSR}),r.methods=Y(r,r.options.methods);let n=r.options.render({...r||{},setState:r.setState.bind(r),...r.renderMethods||{}}),o=tr(n),s=nr(r,o);return{unwrapped:o,wrapped:s}}catch(t){i("component.render.toHTML",t)}};var Dr=(r={})=>{try{return Object.values(r).reduce((e={},t)=>(e[t.name]=t.value,e),{})}catch(e){i("component.virtualDOM.build.parseAttributeMap",e)}},cr=(r={})=>{try{return r.tagName==="WHEN"?[].flatMap.call(r?.childNodes,e=>e?.tagName==="WHEN"?cr(e):H(e)):H(r)}catch(e){i("component.virtualDOM.build.flattenWhenTags",e)}},H=(r={})=>{try{let e=r&&r.tagName&&r.tagName.toLowerCase()||"text",t={tagName:e,attributes:Dr(r.attributes),children:[].flatMap.call(r.childNodes,n=>cr(n))};return e==="text"&&(t=r.textContent),t}catch(e){i("component.virtualDOM.build",e)}},sr=H;var Lr=(r="")=>{try{let e=document.createElement("div");return e.innerHTML=r,e?.childNodes[0]}catch(e){i("component.virtualDOM.build.convertHTMLToDOM",e)}},dr=(r="")=>{try{let e=Lr(r);return sr(e)}catch(e){i("component.virtualDOM.build",e)}};var lr=(r="")=>{try{return document.createElement("div").setAttribute(r,"Test"),!0}catch{return!1}};var vr=(r={})=>{try{let e=document.createElement(r.tagName),t=Object.entries(r.attributes);for(let n=0;n<t.length;n+=1){let[o,s]=t[n];lr(o)&&e.setAttribute(o,s)}for(let n=0;n<r?.children?.length;n+=1){let o=r?.children[n];if(o){let s=ur(o);e.appendChild(s)}}return e}catch(e){i("component.virtualDOM.renderTreeToDOM.renderElement",e)}},ur=(r=null)=>{try{return Q(r)?document.createTextNode(r):vr(r)}catch(e){i("component.virtualDOM.renderTreeToDOM",e)}},pr=ur;var fr=(r={},e={})=>{try{let t=ar(r,{existingChildren:e?.existingChildren}),n=dr(t.wrapped,r),o=e.includeActual&&n?pr(n):null;return{html:t,virtual:n,actual:o}}catch(t){i("component.render.getUpdatedDOM",t)}};var hr=(r={},e="",t="id")=>{try{let n=r&&r.id;if(G(r)&&n){let o=Object.keys(r);for(let s=0;s<o.length;s+=1){let m=o[s],l=r[m];if(m===t&&l===e)return r;if(m==="children"&&Array.isArray(l))for(let M=0;M<l.length;M+=1){let j=l[M],R=hr(j,e,t);if(R!==null)return R}}}return null}catch(n){i("component.findComponentInTreeByField",n)}},mr=hr;var wr=(r="",e={},t=null)=>{let n=mr(t||window.joystick._internal.tree,r,"instanceId");n&&(n.children=[...n.children||[],e])};var Ar=(r={},e={},t=null)=>{try{let n=fr(r,{includeActual:!0,existingChildren:t});return r.dom=n,r.setDOMNodeOnInstance(),e.renderedComponent=r,n.html.wrapped}catch(n){i("component.renderMethods.component.renderForClient",n)}},Nr=(r={})=>{try{return r.renderToHTML({ssrTree:r.parent.ssrTree,translations:r.parent.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r.parent?.dataFromSSR}).wrapped}catch(e){i("component.renderMethods.component.renderToHTMLForSSR",e)}},Pr=(r={})=>{try{return r.parent.ssrTree.dataFunctions.push(async()=>{try{let e=await r.options.data(r.parent.options.api,r.parent.options.req);return r.data=e||{},{componentId:r.id,ssrId:r.ssrId,data:e}}catch(e){return{componentId:r.id,ssrId:r.ssrId,data:null,error:e}}}),r.renderToHTML({ssrTree:r?.parent?.ssrTree,translations:r?.parent?.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r?.parent?.dataFromSSR})}catch(e){i("component.renderMethods.component.collectDataFunctionsForSSR",e)}},Hr=(r={})=>{try{let e={id:r.id,instanceId:r.instanceId,instance:r,children:[]};wr(r.parent.instanceId,e,r.parent&&r.parent.ssrTree||null)}catch(e){i("component.renderMethods.component.handleAddComponentToParent",e)}},_r=(r={},e={})=>{try{!r.renderedComponent&&e.options&&e.options.lifecycle&&(e.options.lifecycle.onBeforeMount&&C("lifecycle.onBeforeMount",()=>{e.options.lifecycle.onBeforeMount(e),k(`ui.${e?.options?.test?.name||E()}.lifecycle.onBeforeMount`,[e])}),!r.renderedComponent&&e.options.lifecycle.onMount&&C("lifecycle.onMount",()=>{e.options.lifecycle.onMount(e),k(`ui.${e?.options?.test?.name||E()}.lifecycle.onMount`,[e])}))}catch(t){i("component.renderMethods.component.handleLifecycle",t)}},Ir=(r={},e={},t={})=>{try{!e.walkingTreeForSSR&&r?.options?.lifecycle?.onUpdateProps&&(0,yr.diff)(e?.existingPropsMap,t)?.length>0&&C("lifecycle.onUpdateProps",()=>{let o=e?.existingPropsMap&&e?.existingPropsMap[r.id];r.options.lifecycle.onUpdateProps(o||{},t,r),k(`ui.${r?.options?.test?.name||E()}.lifecycle.onBeforeMount`,[o||{},t,r])})}catch(n){i("component.renderMethods.component.handleOnChangeProps",n)}},$r=function(){return function(e=null,t={},n={}){let o=e({props:t,url:n.url,translations:n.translations,api:n.options.api,req:n.options.req,dataFromSSR:n?.dataFromSSR,parent:n}),s=n?.existingStateMap[o.id]||{},m=n.children[o.id]||[],l=s[m?.length];return o.state=l?.state||o.state,o.values=l?.values||o.values,n.children[o.id]=[...n.children[o.id]||[],o],o.parent=n,Ir(o,n,t),C("lifecycle.onMount",()=>{o.setDOMNodeOnInstance()}),_r(this,o),o.parent&&Hr(o),o.options.data&&o.parent.walkingTreeForSSR&&o.parent.ssrTree.dataFunctions?Pr(o):o.parent&&o.parent.ssrTree?Nr(o):Ar(o,this,l?.children)}},Ur=function(e,t){try{let n=this;return new $r().bind({})(e,t,n)}catch(n){i("component.renderMethods.component",n)}},_=Ur;var qr=function(e=[],t=null){try{return z(t)&&e&&Array.isArray(e)?e.map((n,o)=>t(n,o)).join(""):""}catch(n){i("component.renderMethods.each",n)}},I=qr;var Br=(r="",e=[])=>{try{return e.reduce((t,[n,o])=>t.replace(`{{${n}}}`,o),r)}catch(t){i("component.renderMethods.i18n.replacePlaceholdersInString",t)}},$=(r="",e=[])=>{try{let t=typeof r=="string",n=Array.isArray(r),o=typeof r=="object"&&!n;if(t)return Br(r,e);if(n)return r?.map(s=>$(s,e));if(o)return Object.entries(r)?.reduce((s={},[m,l])=>(s[m]=$(l,e),s),{})}catch(t){i("component.renderMethods.i18n.handleTranslationReplacement",t)}},Wr=(r="",e={})=>{try{return r?.split(".").reduce((t,n)=>t&&t[n]||"",e)}catch(t){i("component.renderMethods.i18n.getTranslationAtPath",t)}},zr=function(r="",e={}){try{let t=v()?this.translations:window.__joystick_i18n__,o=r?.includes(".")?Wr(r,t):t[r];if(!t||!o)return"";let s=Object.entries(e);return $(o,s)}catch(t){i("component.renderMethods.i18n",t)}},U=zr;var Gr=function(e=!1,t=""){try{return this?.renderingHTMLWithDataForSSR||e?`<when>${t.trim()}</when>`:"<when> </when>"}catch(n){i("component.renderMethods.when",n)}},q=Gr;var X={c:_,component:_,e:I,each:I,i:U,i18n:U,w:q,when:q};export{X as default};
