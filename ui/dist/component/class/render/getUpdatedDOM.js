var mr=Object.create;var v=Object.defineProperty;var wr=Object.getOwnPropertyDescriptor;var yr=Object.getOwnPropertyNames;var xr=Object.getPrototypeOf,Mr=Object.prototype.hasOwnProperty;var Tr=r=>v(r,"__esModule",{value:!0});var gr=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var Fr=(r,e,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of yr(e))!Mr.call(r,n)&&n!=="default"&&v(r,n,{get:()=>e[n],enumerable:!(t=wr(e,n))||t.enumerable});return r},Or=r=>Fr(Tr(v(r!=null?mr(xr(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);var z=gr(R=>{(function(r,e){if(typeof define=="function"&&define.amd)define(["exports"],e);else if(typeof R!="undefined")e(R);else{var t={exports:{}};e(t.exports),r.index=t.exports}})(R,function(r){"use strict";function e(s){return e=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(c){return typeof c}:function(c){return c&&typeof Symbol=="function"&&c.constructor===Symbol&&c!==Symbol.prototype?"symbol":typeof c},e(s)}function t(s,c){return c&&(e(c)==="object"||typeof c=="function")?c:n(s)}function n(s){if(s===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return s}function o(s){return o=Object.setPrototypeOf?Object.getPrototypeOf:function(c){return c.__proto__||Object.getPrototypeOf(c)},o(s)}function a(s,c){if(typeof c!="function"&&c!==null)throw new TypeError("Super expression must either be null or a function");s.prototype=Object.create(c&&c.prototype,{constructor:{value:s,writable:!0,configurable:!0}}),c&&m(s,c)}function m(s,c){return m=Object.setPrototypeOf||function(p,T){return p.__proto__=T,p},m(s,c)}function l(s,c){if(!(s instanceof c))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0}),r.diff=void 0;var M=function s(c,p){l(this,s),this.type=c,this.path=p?p.toString():""},k=function(s){function c(p,T,d){var F;return l(this,c),F=t(this,o(c).call(this,"E",p)),F.lhs=T,F.rhs=d,F}return a(c,s),c}(M),C=function(s){function c(p,T,d,F){var f;return l(this,c),f=t(this,o(c).call(this,"M",p)),f.item=T,f.lhsIndex=d,f.rhsIndex=F,f}return a(c,s),c}(M),L=function(s){function c(p,T){var d;return l(this,c),d=t(this,o(c).call(this,"D",p)),d.lhs=T,d}return a(c,s),c}(M),A=function(s){function c(p,T){var d;return l(this,c),d=t(this,o(c).call(this,"A",p)),d.rhs=T,d}return a(c,s),c}(M),S=function(s,c){return s?"".concat(s,".").concat(c):c};r.diff=function(c,p){var T=2<arguments.length&&arguments[2]!==void 0?arguments[2]:{},d=[],F=T.matchKey,f=T.types||["E","A","D","M"],hr=function(h,u,w,b){h.forEach(function(O,y){var g=u.findIndex(function(x){return x[b]===O[b]});-1<g?(-1<f.indexOf("M")&&y!==g&&d.push(new C(w,O,y,g)),j(O,u[g],S(w,g))):-1<f.indexOf("D")&&d.push(new L(w,O))}),u.forEach(function(O,y){var g=h.findIndex(function(x){return O[b]===x[b]});-1<f.indexOf("A")&&g===-1&&d.push(new A(S(w,y),O))})},j=function(h,u,w){var b=Object.prototype.toString.call(h),O=Object.prototype.toString.call(u);if(-1<f.indexOf("E")&&b!==O)return d.push(new k(w,h,u)),!1;if(b==="[object Object]")Object.getOwnPropertyNames(h).forEach(function(x){Object.prototype.hasOwnProperty.call(u,x)?j(h[x],u[x],S(w,x)):-1<f.indexOf("D")&&d.push(new L(S(w,x),h[x]))}),Object.getOwnPropertyNames(u).forEach(function(x){-1<f.indexOf("A")&&!Object.prototype.hasOwnProperty.call(h,x)&&d.push(new A(S(w,x),u[x]))});else if(b!=="[object Array]")-1<f.indexOf("E")&&h!==u&&d.push(new k(w,h,u));else if(F)hr(h,u,w,F);else{var y=h.length-1,g=u.length-1;if(-1<f.indexOf("D"))for(;y>g;)d.push(new L(S(w,y),h[y--]));if(-1<f.indexOf("A"))for(;g>y;)d.push(new A(S(w,g),u[g--]));for(;0<=y;--y)j(h[y],u[y],S(w,y))}};return j(c,p),d}})});var i=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var $=r=>{try{return!!Array.isArray(r)}catch(e){i("types.isArray",e)}};var U=r=>{try{return typeof r=="function"}catch(e){i("types.isFunction",e)}};var q=r=>{try{return!!(r&&typeof r=="object"&&!Array.isArray(r))}catch(e){i("types.isObject",e)}};var B=r=>{try{return typeof r=="string"}catch(e){i("types.isString",e)}};var W=(r=[],e="")=>{try{return($(r)&&r.find(n=>n?.componentId===e))?.data||{}}catch(t){i("findComponentDataFromSSR",t)}};var K=Or(z());var D=()=>typeof window=="undefined";var Sr=(r="")=>{try{let[e,t]=r?.split(".");return t?window?.joystick?._internal?.queues[e][t]:window?.joystick?._internal?.queues[e]}catch(e){i("addToQueue.getQueue",e)}},E=(r="",e=null)=>{try{D()||(Sr(r)||{}).array.push({callback:e})}catch(t){i("addToQueue",t)}};var G=(r={},e="",t="id")=>{try{let n=r&&r.id;if(q(r)&&n){let o=Object.keys(r);for(let a=0;a<o.length;a+=1){let m=o[a],l=r[m];if(m===t&&l===e)return r;if(m==="children"&&Array.isArray(l))for(let M=0;M<l.length;M+=1){let k=l[M],C=G(k,e,t);if(C!==null)return C}}}return null}catch(n){i("component.findComponentInTreeByField",n)}},Q=G;var V=(r="",e={},t=null)=>{let n=Q(t||window.joystick._internal.tree,r,"instanceId");n&&(n.children=[...n.children||[],e])};var br=(r={},e={},t=null)=>{try{let n=X(r,{includeActual:!0,existingChildren:t});return r.dom=n,r.setDOMNodeOnInstance(),e.renderedComponent=r,n.html.wrapped}catch(n){i("component.renderMethods.component.renderForClient",n)}},Er=(r={})=>{try{return r.renderToHTML({ssrTree:r.parent.ssrTree,translations:r.parent.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r.parent?.dataFromSSR}).wrapped}catch(e){i("component.renderMethods.component.renderToHTMLForSSR",e)}},kr=(r={})=>{try{return r.parent.ssrTree.dataFunctions.push(async()=>{try{let e=await r.options.data(r.parent.options.api,r.parent.options.req);return r.data=e||{},{componentId:r.id,ssrId:r.ssrId,data:e}}catch(e){return{componentId:r.id,ssrId:r.ssrId,data:null,error:e}}}),r.renderToHTML({ssrTree:r?.parent?.ssrTree,translations:r?.parent?.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r?.parent?.dataFromSSR})}catch(e){i("component.renderMethods.component.collectDataFunctionsForSSR",e)}},Cr=(r={})=>{try{let e={id:r.id,instanceId:r.instanceId,instance:r,children:[]};V(r.parent.instanceId,e,r.parent&&r.parent.ssrTree||null)}catch(e){i("component.renderMethods.component.handleAddComponentToParent",e)}},jr=(r={},e={})=>{try{!r.renderedComponent&&e.options&&e.options.lifecycle&&(e.options.lifecycle.onBeforeMount&&E("lifecycle.onBeforeMount",()=>{e.options.lifecycle.onBeforeMount(e)}),!r.renderedComponent&&e.options.lifecycle.onMount&&E("lifecycle.onMount",()=>{e.options.lifecycle.onMount(e)}))}catch(t){i("component.renderMethods.component.handleLifecycle",t)}},Rr=(r={},e={},t={})=>{try{!e.walkingTreeForSSR&&r?.options?.lifecycle?.onUpdateProps&&(0,K.diff)(e?.existingPropsMap,t)?.length>0&&E("lifecycle.onUpdateProps",()=>{let o=e?.existingPropsMap&&e?.existingPropsMap[r.id];r.options.lifecycle.onUpdateProps(o||{},t,r)})}catch(n){i("component.renderMethods.component.handleOnChangeProps",n)}},Dr=function(){return function(e=null,t={},n={}){let o=e({props:t,url:n.url,translations:n.translations,api:n.options.api,req:n.options.req,dataFromSSR:n?.dataFromSSR,parent:n}),a=n?.existingStateMap[o.id]||{},m=n.children[o.id]||[],l=a[m?.length];return o.state=l?.state||o.state,n.children[o.id]=[...n.children[o.id]||[],o],o.parent=n,Rr(o,n,t),E("lifecycle.onMount",()=>{o.setDOMNodeOnInstance()}),jr(this,o),o.parent&&Cr(o),o.options.data&&o.parent.walkingTreeForSSR&&o.parent.ssrTree.dataFunctions?kr(o):o.parent&&o.parent.ssrTree?Er(o):br(o,this,l?.children)}},Lr=function(e,t){try{let n=this;return new Dr().bind({})(e,t,n)}catch(n){i("component.renderMethods.component",n)}},H=Lr;var Ar=function(e=[],t=null){try{return U(t)&&e&&Array.isArray(e)?e.map((n,o)=>t(n,o)).join(""):""}catch(n){i("component.renderMethods.each",n)}},N=Ar;var vr=function(e="",t={}){try{let n=D()?this.translations:window.__joystick_i18n__;if(!n||!n[e])return"";let o=Object.entries(t);return o.length>0?o.reduce((a,[m,l])=>a.replace(`{{${m}}}`,l),n[e]):n[e]}catch(n){i("component.renderMethods.i18n",n)}},I=vr;var Hr=function(e=!1,t=""){try{return this?.renderingHTMLWithDataForSSR||e?`<when>${t.trim()}</when>`:"<when> </when>"}catch(n){i("component.renderMethods.when",n)}},_=Hr;var J={c:H,component:H,e:N,each:N,i:I,i18n:I,w:_,when:_};var Y=(r={},e={})=>{try{return Object.entries(J).reduce((t,[n,o])=>(t[n]=o.bind({...r,...e}),t),{})}catch(t){i("component.renderMethods.compile",t)}};var Z=(r={},e={})=>{try{return Object.entries(e).reduce((t={},[n,o])=>(t[n]=(...a)=>o(...a,{...r,setState:r.setState.bind(r),...r.renderMethods||{}}),t),{})}catch{i("component.methods.compile")}};var rr=(r={})=>{try{return Object.entries(r)?.reduce((e={},[t,n]={})=>(e[t]=n?.map((o={})=>({state:o?.state,children:rr(o?.children)})),e),{})}catch(e){i("component.render.getExistingStateMap.buildMapForChildren",e)}},er=(r={})=>{try{return rr(r)}catch(e){i("component.render.getExistingStateMap",e)}};var tr=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),Nr=new RegExp(/\n/g);var Ir=(r="")=>{try{return(r.match(tr)||[]).forEach(t=>{r=r.replace(t,"")}),r}catch(e){i("component.render.sanitizeHTML.removeCommentedCode",e)}},nr=(r="")=>{try{let e=`${r}`;return e=Ir(e),e}catch(e){i("component.render.sanitizeHTML",e)}};var or=(r={},e="")=>{try{let{wrapper:t=null,ssrId:n=null,id:o=null,instanceId:a=null}=r;return`<div ${t?.id?`id="${t.id}" `:""}${t?.classList?`class="${t.classList?.join(" ")}" `:""}js-ssrId="${n}" js-c="${o}" js-i="${a}">${e}</div>`}catch(t){i("component.render.wrapHTML",t)}};var ir=(r={},e=[])=>{try{let t=[...e],n=Object.entries(r);for(let o=0;o<n?.length;o+=1){let[a,m]=n[o];for(let l=0;l<m?.length;l+=1){let M=m[l];Object.entries(M?.timers)?.length>0&&t.push(...Object.values(M?.timers)),Object.entries(M?.children)?.length>0&&ir(M?.children,t)}}if(t?.length>0)for(let o=0;o<t?.length;o+=1)clearTimeout(t[o])}catch(t){i("component.render.clearTimersOnChildren",t)}},cr=ir;var sr=(r={},e={})=>{try{e?.dataFromSSR&&(r.data=W(e.dataFromSSR,r.id)||{}),cr(r?.children);let t=er(e?.existingChildren||r?.children)||{};r.children={},r.renderMethods=Y({...r,existingStateMap:t,translations:e?.translations||r.translations||{},ssrTree:e?.ssrTree,walkingTreeForSSR:e?.walkingTreeForSSR,renderingHTMLWithDataForSSR:e?.renderingHTMLWithDataForSSR,dataFromSSR:e?.dataFromSSR}),r.methods=Z(r,r.options.methods);let n=r.options.render({...r||{},setState:r.setState.bind(r),...r.renderMethods||{}}),o=nr(n),a=or(r,o);return{unwrapped:o,wrapped:a}}catch(t){i("component.render.toHTML",t)}};var _r=(r={})=>{try{return Object.values(r).reduce((e={},t)=>(e[t.name]=t.value,e),{})}catch(e){i("component.virtualDOM.build.parseAttributeMap",e)}},ar=(r={})=>{try{return r.tagName==="WHEN"?[].flatMap.call(r?.childNodes,e=>e?.tagName==="WHEN"?ar(e):P(e)):P(r)}catch(e){i("component.virtualDOM.build.flattenWhenTags",e)}},P=(r={})=>{try{let e=r&&r.tagName&&r.tagName.toLowerCase()||"text",t={tagName:e,attributes:_r(r.attributes),children:[].flatMap.call(r.childNodes,n=>ar(n))};return e==="text"&&(t=r.textContent),t}catch(e){i("component.virtualDOM.build",e)}},dr=P;var Pr=(r="")=>{try{let e=document.createElement("div");return e.innerHTML=r,e?.childNodes[0]}catch(e){i("component.virtualDOM.build.convertHTMLToDOM",e)}},lr=(r="")=>{try{let e=Pr(r);return dr(e)}catch(e){i("component.virtualDOM.build",e)}};var ur=(r="")=>{try{return document.createElement("div").setAttribute(r,"Test"),!0}catch{return!1}};var $r=(r={})=>{try{let e=document.createElement(r.tagName),t=Object.entries(r.attributes);for(let n=0;n<t.length;n+=1){let[o,a]=t[n];ur(o)&&e.setAttribute(o,a)}for(let n=0;n<r?.children?.length;n+=1){let o=r?.children[n];if(o){let a=pr(o);e.appendChild(a)}}return e}catch(e){i("component.virtualDOM.renderTreeToDOM.renderElement",e)}},pr=(r=null)=>{try{return B(r)?document.createTextNode(r):$r(r)}catch(e){i("component.virtualDOM.renderTreeToDOM",e)}},fr=pr;var X=(r={},e={})=>{try{let t=sr(r,{existingChildren:e?.existingChildren}),n=lr(t.wrapped,r),o=e.includeActual&&n?fr(n):null;return{html:t,virtual:n,actual:o}}catch(t){i("component.render.getUpdatedDOM",t)}};export{X as default};
