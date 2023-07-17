var mr=Object.create;var H=Object.defineProperty;var wr=Object.getOwnPropertyDescriptor;var yr=Object.getOwnPropertyNames;var xr=Object.getPrototypeOf,Mr=Object.prototype.hasOwnProperty;var gr=r=>H(r,"__esModule",{value:!0});var Tr=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var Fr=(r,e,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of yr(e))!Mr.call(r,o)&&o!=="default"&&H(r,o,{get:()=>e[o],enumerable:!(t=wr(e,o))||t.enumerable});return r},Or=r=>Fr(gr(H(r!=null?mr(xr(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);var G=Tr(R=>{(function(r,e){if(typeof define=="function"&&define.amd)define(["exports"],e);else if(typeof R!="undefined")e(R);else{var t={exports:{}};e(t.exports),r.index=t.exports}})(R,function(r){"use strict";function e(a){return e=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(c){return typeof c}:function(c){return c&&typeof Symbol=="function"&&c.constructor===Symbol&&c!==Symbol.prototype?"symbol":typeof c},e(a)}function t(a,c){return c&&(e(c)==="object"||typeof c=="function")?c:o(a)}function o(a){if(a===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function n(a){return n=Object.setPrototypeOf?Object.getPrototypeOf:function(c){return c.__proto__||Object.getPrototypeOf(c)},n(a)}function s(a,c){if(typeof c!="function"&&c!==null)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(c&&c.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),c&&m(a,c)}function m(a,c){return m=Object.setPrototypeOf||function(p,g){return p.__proto__=g,p},m(a,c)}function l(a,c){if(!(a instanceof c))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0}),r.diff=void 0;var M=function a(c,p){l(this,a),this.type=c,this.path=p?p.toString():""},k=function(a){function c(p,g,d){var F;return l(this,c),F=t(this,n(c).call(this,"E",p)),F.lhs=g,F.rhs=d,F}return s(c,a),c}(M),C=function(a){function c(p,g,d,F){var f;return l(this,c),f=t(this,n(c).call(this,"M",p)),f.item=g,f.lhsIndex=d,f.rhsIndex=F,f}return s(c,a),c}(M),A=function(a){function c(p,g){var d;return l(this,c),d=t(this,n(c).call(this,"D",p)),d.lhs=g,d}return s(c,a),c}(M),v=function(a){function c(p,g){var d;return l(this,c),d=t(this,n(c).call(this,"A",p)),d.rhs=g,d}return s(c,a),c}(M),S=function(a,c){return a?"".concat(a,".").concat(c):c};r.diff=function(c,p){var g=2<arguments.length&&arguments[2]!==void 0?arguments[2]:{},d=[],F=g.matchKey,f=g.types||["E","A","D","M"],hr=function(h,u,w,b){h.forEach(function(O,y){var T=u.findIndex(function(x){return x[b]===O[b]});-1<T?(-1<f.indexOf("M")&&y!==T&&d.push(new C(w,O,y,T)),j(O,u[T],S(w,T))):-1<f.indexOf("D")&&d.push(new A(w,O))}),u.forEach(function(O,y){var T=h.findIndex(function(x){return O[b]===x[b]});-1<f.indexOf("A")&&T===-1&&d.push(new v(S(w,y),O))})},j=function(h,u,w){var b=Object.prototype.toString.call(h),O=Object.prototype.toString.call(u);if(-1<f.indexOf("E")&&b!==O)return d.push(new k(w,h,u)),!1;if(b==="[object Object]")Object.getOwnPropertyNames(h).forEach(function(x){Object.prototype.hasOwnProperty.call(u,x)?j(h[x],u[x],S(w,x)):-1<f.indexOf("D")&&d.push(new A(S(w,x),h[x]))}),Object.getOwnPropertyNames(u).forEach(function(x){-1<f.indexOf("A")&&!Object.prototype.hasOwnProperty.call(h,x)&&d.push(new v(S(w,x),u[x]))});else if(b!=="[object Array]")-1<f.indexOf("E")&&h!==u&&d.push(new k(w,h,u));else if(F)hr(h,u,w,F);else{var y=h.length-1,T=u.length-1;if(-1<f.indexOf("D"))for(;y>T;)d.push(new A(S(w,y),h[y--]));if(-1<f.indexOf("A"))for(;T>y;)d.push(new v(S(w,T),u[T--]));for(;0<=y;--y)j(h[y],u[y],S(w,y))}};return j(c,p),d}})});var i=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var $=r=>{try{return!!Array.isArray(r)}catch(e){i("types.isArray",e)}};var q=r=>{try{return typeof r=="function"}catch(e){i("types.isFunction",e)}};var B=r=>{try{return!!(r&&typeof r=="object"&&!Array.isArray(r))}catch(e){i("types.isObject",e)}};var W=r=>{try{return typeof r=="string"}catch(e){i("types.isString",e)}};var z=(r=[],e="")=>{try{return($(r)&&r.find(o=>o?.componentId===e))?.data||{}}catch(t){i("findComponentDataFromSSR",t)}};var X=Or(G());var D=()=>typeof window=="undefined";var Sr=(r="")=>{try{let[e,t]=r?.split(".");return t?window?.joystick?._internal?.queues[e][t]:window?.joystick?._internal?.queues[e]}catch(e){i("addToQueue.getQueue",e)}},E=(r="",e=null)=>{try{D()||(Sr(r)||{}).array.push({callback:e})}catch(t){i("addToQueue",t)}};var Q=(r={},e="",t="id")=>{try{let o=r&&r.id;if(B(r)&&o){let n=Object.keys(r);for(let s=0;s<n.length;s+=1){let m=n[s],l=r[m];if(m===t&&l===e)return r;if(m==="children"&&Array.isArray(l))for(let M=0;M<l.length;M+=1){let k=l[M],C=Q(k,e,t);if(C!==null)return C}}}return null}catch(o){i("component.findComponentInTreeByField",o)}},V=Q;var K=(r="",e={},t=null)=>{let o=V(t||window.joystick._internal.tree,r,"instanceId");o&&(o.children=[...o.children||[],e])};var br=(r={},e={},t=null)=>{try{let o=L(r,{includeActual:!0,existingChildren:t});return r.dom=o,r.setDOMNodeOnInstance(),e.renderedComponent=r,o.html.wrapped}catch(o){i("component.renderMethods.component.renderForClient",o)}},Er=(r={})=>{try{return r.renderToHTML({ssrTree:r.parent.ssrTree,translations:r.parent.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r.parent?.dataFromSSR}).wrapped}catch(e){i("component.renderMethods.component.renderToHTMLForSSR",e)}},kr=(r={})=>{try{return r.parent.ssrTree.dataFunctions.push(async()=>{try{let e=await r.options.data(r.parent.options.api,r.parent.options.req);return r.data=e||{},{componentId:r.id,ssrId:r.ssrId,data:e}}catch(e){return{componentId:r.id,ssrId:r.ssrId,data:null,error:e}}}),r.renderToHTML({ssrTree:r?.parent?.ssrTree,translations:r?.parent?.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r?.parent?.dataFromSSR})}catch(e){i("component.renderMethods.component.collectDataFunctionsForSSR",e)}},Cr=(r={})=>{try{let e={id:r.id,instanceId:r.instanceId,instance:r,children:[]};K(r.parent.instanceId,e,r.parent&&r.parent.ssrTree||null)}catch(e){i("component.renderMethods.component.handleAddComponentToParent",e)}},jr=(r={},e={})=>{try{!r.renderedComponent&&e.options&&e.options.lifecycle&&(e.options.lifecycle.onBeforeMount&&E("lifecycle.onBeforeMount",()=>{e.options.lifecycle.onBeforeMount(e)}),!r.renderedComponent&&e.options.lifecycle.onMount&&E("lifecycle.onMount",()=>{e.options.lifecycle.onMount(e)}))}catch(t){i("component.renderMethods.component.handleLifecycle",t)}},Rr=(r={},e={},t={})=>{try{!e.walkingTreeForSSR&&r?.options?.lifecycle?.onUpdateProps&&(0,X.diff)(e?.existingPropsMap,t)?.length>0&&E("lifecycle.onUpdateProps",()=>{let n=e?.existingPropsMap&&e?.existingPropsMap[r.id];r.options.lifecycle.onUpdateProps(n||{},t,r)})}catch(o){i("component.renderMethods.component.handleOnChangeProps",o)}},Dr=function(){return function(e=null,t={},o={}){let n=e({props:t,url:o.url,translations:o.translations,api:o.options.api,req:o.options.req,dataFromSSR:o?.dataFromSSR,parent:o}),s=o?.existingStateMap[n.id]||{},m=o.children[n.id]||[],l=s[m?.length];return n.state=l?.state||n.state,o.children[n.id]=[...o.children[n.id]||[],n],n.parent=o,Rr(n,o,t),E("lifecycle.onMount",()=>{n.setDOMNodeOnInstance()}),jr(this,n),n.parent&&Cr(n),n.options.data&&n.parent.walkingTreeForSSR&&n.parent.ssrTree.dataFunctions?kr(n):n.parent&&n.parent.ssrTree?Er(n):br(n,this,l?.children)}},Lr=function(e,t){try{let o=this;return new Dr().bind({})(e,t,o)}catch(o){i("component.renderMethods.component",o)}},N=Lr;var Ar=function(e=[],t=null){try{return q(t)&&e&&Array.isArray(e)?e.map((o,n)=>t(o,n)).join(""):""}catch(o){i("component.renderMethods.each",o)}},_=Ar;var vr=function(e="",t={}){try{let o=D()?this.translations:window.__joystick_i18n__;if(!o||!o[e])return"";let n=Object.entries(t);return n.length>0?n.reduce((s,[m,l])=>s.replace(`{{${m}}}`,l),o[e]):o[e]}catch(o){i("component.renderMethods.i18n",o)}},I=vr;var Hr=function(e=!1,t=""){try{return this?.renderingHTMLWithDataForSSR||e?`<when>${t.trim()}</when>`:"<when> </when>"}catch(o){i("component.renderMethods.when",o)}},P=Hr;var J={c:N,component:N,e:_,each:_,i:I,i18n:I,w:P,when:P};var Y=(r={},e={})=>{try{return Object.entries(J).reduce((t,[o,n])=>(t[o]=n.bind({...r,...e}),t),{})}catch(t){i("component.renderMethods.compile",t)}};var Z=(r={},e={})=>{try{return Object.entries(e).reduce((t={},[o,n])=>(t[o]=(...s)=>n(...s,{...r,setState:r.setState.bind(r),...r.renderMethods||{}}),t),{})}catch{i("component.methods.compile")}};var rr=(r={})=>{try{return Object.entries(r)?.reduce((e={},[t,o]={})=>(e[t]=o?.map((n={})=>({state:n?.state,children:rr(n?.children)})),e),{})}catch(e){i("component.render.getExistingStateMap.buildMapForChildren",e)}},er=(r={})=>{try{return rr(r)}catch(e){i("component.render.getExistingStateMap",e)}};var tr=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),Nr=new RegExp(/\n/g);var _r=(r="")=>{try{return(r.match(tr)||[]).forEach(t=>{r=r.replace(t,"")}),r}catch(e){i("component.render.sanitizeHTML.removeCommentedCode",e)}},or=(r="")=>{try{let e=`${r}`;return e=_r(e),e}catch(e){i("component.render.sanitizeHTML",e)}};var nr=(r={},e="")=>{try{let{wrapper:t=null,ssrId:o=null,id:n=null,instanceId:s=null}=r;return`<div ${t?.id?`id="${t.id}" `:""}${t?.classList?`class="${t.classList?.join(" ")}" `:""}js-ssrId="${o}" js-c="${n}" js-i="${s}">${e}</div>`}catch(t){i("component.render.wrapHTML",t)}};var ir=(r={},e=[])=>{try{let t=[...e],o=Object.entries(r);for(let n=0;n<o?.length;n+=1){let[s,m]=o[n];for(let l=0;l<m?.length;l+=1){let M=m[l];Object.entries(M?.timers)?.length>0&&t.push(...Object.values(M?.timers)),Object.entries(M?.children)?.length>0&&ir(M?.children,t)}}if(t?.length>0)for(let n=0;n<t?.length;n+=1)clearTimeout(t[n])}catch(t){i("component.render.clearTimersOnChildren",t)}},cr=ir;var ar=(r={},e={})=>{try{e?.dataFromSSR&&(r.data=z(e.dataFromSSR,r.id)||{}),cr(r?.children);let t=er(e?.existingChildren||r?.children)||{};r.children={},r.renderMethods=Y({...r,existingStateMap:t,translations:e?.translations||r.translations||{},ssrTree:e?.ssrTree,walkingTreeForSSR:e?.walkingTreeForSSR,renderingHTMLWithDataForSSR:e?.renderingHTMLWithDataForSSR,dataFromSSR:e?.dataFromSSR}),r.methods=Z(r,r.options.methods);let o=r.options.render({...r||{},setState:r.setState.bind(r),...r.renderMethods||{}}),n=or(o),s=nr(r,n);return{unwrapped:n,wrapped:s}}catch(t){i("component.render.toHTML",t)}};var Ir=(r={})=>{try{return Object.values(r).reduce((e={},t)=>(e[t.name]=t.value,e),{})}catch(e){i("component.virtualDOM.build.parseAttributeMap",e)}},sr=(r={})=>{try{return r.tagName==="WHEN"?[].flatMap.call(r?.childNodes,e=>e?.tagName==="WHEN"?sr(e):U(e)):U(r)}catch(e){i("component.virtualDOM.build.flattenWhenTags",e)}},U=(r={})=>{try{let e=r&&r.tagName&&r.tagName.toLowerCase()||"text",t={tagName:e,attributes:Ir(r.attributes),children:[].flatMap.call(r.childNodes,o=>sr(o))};return e==="text"&&(t=r.textContent),t}catch(e){i("component.virtualDOM.build",e)}},dr=U;var Pr=(r="")=>{try{let e=document.createElement("div");return e.innerHTML=r,e?.childNodes[0]}catch(e){i("component.virtualDOM.build.convertHTMLToDOM",e)}},lr=(r="")=>{try{let e=Pr(r);return dr(e)}catch(e){i("component.virtualDOM.build",e)}};var ur=(r="")=>{try{return document.createElement("div").setAttribute(r,"Test"),!0}catch{return!1}};var Ur=(r={})=>{try{let e=document.createElement(r.tagName),t=Object.entries(r.attributes);for(let o=0;o<t.length;o+=1){let[n,s]=t[o];ur(n)&&e.setAttribute(n,s)}for(let o=0;o<r?.children?.length;o+=1){let n=r?.children[o];if(n){let s=pr(n);e.appendChild(s)}}return e}catch(e){i("component.virtualDOM.renderTreeToDOM.renderElement",e)}},pr=(r=null)=>{try{return W(r)?document.createTextNode(r):Ur(r)}catch(e){i("component.virtualDOM.renderTreeToDOM",e)}},fr=pr;var L=(r={},e={})=>{try{let t=ar(r,{existingChildren:e?.existingChildren}),o=lr(t.wrapped,r),n=e.includeActual&&o?fr(o):null;return{html:t,virtual:o,actual:n}}catch(t){i("component.render.getUpdatedDOM",t)}};var ft=(r={},e={})=>{try{let t=L(r,{includeActual:!0,existingChildren:e?.existingChildren});return r.dom=t,t.actual}catch(t){i("component.render.forMount",t)}};export{ft as default};
