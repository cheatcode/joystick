var lr=Object.create;var H=Object.defineProperty;var fr=Object.getOwnPropertyDescriptor;var mr=Object.getOwnPropertyNames;var hr=Object.getPrototypeOf,wr=Object.prototype.hasOwnProperty;var yr=r=>H(r,"__esModule",{value:!0});var xr=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var Mr=(r,e,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of mr(e))!wr.call(r,n)&&n!=="default"&&H(r,n,{get:()=>e[n],enumerable:!(t=fr(e,n))||t.enumerable});return r},Tr=r=>Mr(yr(H(r!=null?lr(hr(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);var $=xr(D=>{(function(r,e){if(typeof define=="function"&&define.amd)define(["exports"],e);else if(typeof D!="undefined")e(D);else{var t={exports:{}};e(t.exports),r.index=t.exports}})(D,function(r){"use strict";function e(s){return e=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(i){return typeof i}:function(i){return i&&typeof Symbol=="function"&&i.constructor===Symbol&&i!==Symbol.prototype?"symbol":typeof i},e(s)}function t(s,i){return i&&(e(i)==="object"||typeof i=="function")?i:n(s)}function n(s){if(s===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return s}function o(s){return o=Object.setPrototypeOf?Object.getPrototypeOf:function(i){return i.__proto__||Object.getPrototypeOf(i)},o(s)}function d(s,i){if(typeof i!="function"&&i!==null)throw new TypeError("Super expression must either be null or a function");s.prototype=Object.create(i&&i.prototype,{constructor:{value:s,writable:!0,configurable:!0}}),i&&T(s,i)}function T(s,i){return T=Object.setPrototypeOf||function(u,x){return u.__proto__=x,u},T(s,i)}function y(s,i){if(!(s instanceof i))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0}),r.diff=void 0;var S=function s(i,u){y(this,s),this.type=i,this.path=u?u.toString():""},I=function(s){function i(u,x,c){var g;return y(this,i),g=t(this,o(i).call(this,"E",u)),g.lhs=x,g.rhs=c,g}return d(i,s),i}(S),j=function(s){function i(u,x,c,g){var l;return y(this,i),l=t(this,o(i).call(this,"M",u)),l.item=x,l.lhsIndex=c,l.rhsIndex=g,l}return d(i,s),i}(S),L=function(s){function i(u,x){var c;return y(this,i),c=t(this,o(i).call(this,"D",u)),c.lhs=x,c}return d(i,s),i}(S),A=function(s){function i(u,x){var c;return y(this,i),c=t(this,o(i).call(this,"A",u)),c.rhs=x,c}return d(i,s),i}(S),E=function(s,i){return s?"".concat(s,".").concat(i):i};r.diff=function(i,u){var x=2<arguments.length&&arguments[2]!==void 0?arguments[2]:{},c=[],g=x.matchKey,l=x.types||["E","A","D","M"],ur=function(f,p,m,b){f.forEach(function(F,h){var M=p.findIndex(function(w){return w[b]===F[b]});-1<M?(-1<l.indexOf("M")&&h!==M&&c.push(new j(m,F,h,M)),C(F,p[M],E(m,M))):-1<l.indexOf("D")&&c.push(new L(m,F))}),p.forEach(function(F,h){var M=f.findIndex(function(w){return F[b]===w[b]});-1<l.indexOf("A")&&M===-1&&c.push(new A(E(m,h),F))})},C=function(f,p,m){var b=Object.prototype.toString.call(f),F=Object.prototype.toString.call(p);if(-1<l.indexOf("E")&&b!==F)return c.push(new I(m,f,p)),!1;if(b==="[object Object]")Object.getOwnPropertyNames(f).forEach(function(w){Object.prototype.hasOwnProperty.call(p,w)?C(f[w],p[w],E(m,w)):-1<l.indexOf("D")&&c.push(new L(E(m,w),f[w]))}),Object.getOwnPropertyNames(p).forEach(function(w){-1<l.indexOf("A")&&!Object.prototype.hasOwnProperty.call(f,w)&&c.push(new A(E(m,w),p[w]))});else if(b!=="[object Array]")-1<l.indexOf("E")&&f!==p&&c.push(new I(m,f,p));else if(g)ur(f,p,m,g);else{var h=f.length-1,M=p.length-1;if(-1<l.indexOf("D"))for(;h>M;)c.push(new L(E(m,h),f[h--]));if(-1<l.indexOf("A"))for(;M>h;)c.push(new A(E(m,M),p[M--]));for(;0<=h;--h)C(f[h],p[h],E(m,h))}};return C(i,u),c}})});var a=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var dr=Tr($());var O=()=>typeof window=="undefined";var gr=(r="")=>{try{let[e,t]=r?.split(".");return t?window?.joystick?._internal?.queues[e][t]:window?.joystick?._internal?.queues[e]}catch(e){a("addToQueue.getQueue",e)}},R=(r="",e=null)=>{try{O()||(gr(r)||{}).array.push({callback:e})}catch(t){a("addToQueue",t)}};var B=r=>{try{return!!Array.isArray(r)}catch(e){a("types.isArray",e)}};var q=r=>{try{return typeof r=="function"}catch(e){a("types.isFunction",e)}};var W=r=>{try{return!!(r&&typeof r=="object"&&!Array.isArray(r))}catch(e){a("types.isObject",e)}};var z=r=>{try{return typeof r=="string"}catch(e){a("types.isString",e)}};var G=(r=[],e="")=>{try{return(B(r)&&r.find(n=>n?.componentId===e))?.data||{}}catch(t){a("findComponentDataFromSSR",t)}};var Q=(r={},e="",t="id")=>{try{let n=r&&r.id;if(W(r)&&n){let o=Object.keys(r);for(let d=0;d<o.length;d+=1){let T=o[d],y=r[T];if(T===t&&y===e)return r;if(T==="children"&&Array.isArray(y))for(let S=0;S<y.length;S+=1){let I=y[S],j=Q(I,e,t);if(j!==null)return j}}}return null}catch(n){a("component.findComponentInTreeByField",n)}},k=Q;var V=(r={})=>{try{let e={},t=k(window.joystick._internal.tree,r.instanceId);return t&&(e[t?.instance?.instanceId]=t?.instance?.props),t?.children?.reduce((n={},o)=>(n[o?.instance?.instanceId]||(n[o?.instance?.instanceId]=o?.instance?.props),n),e)}catch(e){a("component.render.getExistingPropsMap",e)}};var K=(r={})=>{try{let e={},t=k(window.joystick._internal.tree,r.instanceId);return t&&(e[t?.instance?.instanceId]=t?.instance?.state),t?.children?.reduce((n={},o)=>(n[o?.instance?.instanceId]||(n[o?.instance?.instanceId]=o?.instance?.state),n),e)}catch(e){a("component.render.getExistingStateMap",e)}};var X=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),Fr=new RegExp(/\n/g);var Sr=(r="")=>{try{return(r.match(X)||[]).forEach(t=>{r=r.replace(t,"")}),r}catch(e){a("component.render.sanitizeHTML.removeCommentedCode",e)}},J=(r="")=>{try{let e=`${r}`;return e=Sr(e),e}catch(e){a("component.render.sanitizeHTML",e)}};var Y=(r={},e="")=>{try{let{wrapper:t=null,ssrId:n=null,id:o=null,instanceId:d=null}=r;return`<div ${t?.id?`id="${t.id}" `:""}${t?.classList?`class="${t.classList?.join(" ")}" `:""}js-ssrId="${n}" js-c="${o}" js-i="${d}">${e}</div>`}catch(t){a("component.render.wrapHTML",t)}};var Z=(r={},e={})=>{try{e?.dataFromSSR&&(r.data=G(e.dataFromSSR,r.id)||{});let t={...r,getExistingPropsMap:{},existingPropsMap:O()?{}:V(r),existingStateMap:O()?{}:K(r),ssrTree:e?.ssrTree,translations:e?.translations||r.translations||{},walkingTreeForSSR:e?.walkingTreeForSSR,renderingHTMLWithDataForSSR:e?.renderingHTMLWithDataForSSR,dataFromSSR:e?.dataFromSSR},n=rr(t),o=r.options.render({...r||{},setState:r.setState.bind(r),...n||{}}),d=J(o),T=Y(r,d);return{unwrapped:d,wrapped:T}}catch(t){a("component.render.toHTML",t)}};var Er=(r={})=>{try{return Object.values(r).reduce((e={},t)=>(e[t.name]=t.value,e),{})}catch(e){a("component.virtualDOM.build.parseAttributeMap",e)}},er=(r={})=>{try{return r.tagName==="WHEN"?[].flatMap.call(r?.childNodes,e=>e?.tagName==="WHEN"?er(e):v(e)):v(r)}catch(e){a("component.virtualDOM.build.flattenWhenTags",e)}},v=(r={})=>{try{let e=r&&r.tagName&&r.tagName.toLowerCase()||"text",t={tagName:e,attributes:Er(r.attributes),children:[].flatMap.call(r.childNodes,n=>er(n))};return e==="text"&&(t=r.textContent),t}catch(e){a("component.virtualDOM.build",e)}},tr=v;var br=(r="",e="")=>{try{let t=document.createElement("div");return t.setAttribute("js-c",e),t.innerHTML=r,t}catch(t){a("component.virtualDOM.build.convertHTMLToDOM",t)}},nr=(r="",e="")=>{try{let t=br(r,e);return tr(t)}catch(t){a("component.virtualDOM.build",t)}};var or=(r="")=>{try{return document.createElement("div").setAttribute(r,"Test"),!0}catch{return!1}};var Or=(r={})=>{try{let e=document.createElement(r.tagName),t=Object.entries(r.attributes);for(let n=0;n<t.length;n+=1){let[o,d]=t[n];or(o)&&e.setAttribute(o,d)}for(let n=0;n<r?.children?.length;n+=1){let o=r?.children[n];if(o){let d=ir(o);e.appendChild(d)}}return e}catch(e){a("component.virtualDOM.renderTreeToDOM.renderElement",e)}},ir=(r=null)=>{try{return z(r)?document.createTextNode(r):Or(r)}catch(e){a("component.virtualDOM.renderTreeToDOM",e)}},ar=ir;var sr=(r={},e={})=>{try{let t=Z(r),n=nr(t.unwrapped,r.id),o=e.includeActual&&n?ar(n):null;return{html:t,virtual:n,actual:o}}catch(t){a("component.render.getUpdatedDOM",t)}};var cr=(r="",e={},t=null)=>{let n=k(t||window.joystick._internal.tree,r,"instanceId");n&&(n.children=[...n.children||[],e])};var kr=(r={},e={})=>{try{let t=sr(r,{includeActual:!0});return r.dom=t,r.setDOMNodeOnInstance(),r.appendCSSToHead(),e.renderedComponent=r,t.html.wrapped}catch(t){a("component.renderMethods.component.renderForClient",t)}},Rr=(r={})=>{try{return r.renderToHTML({ssrTree:r.parent.ssrTree,translations:r.parent.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r.parent?.dataFromSSR}).wrapped}catch(e){a("component.renderMethods.component.renderToHTMLForSSR",e)}},Ir=(r={})=>{try{return r.parent.ssrTree.dataFunctions.push(async()=>{let e=await r.options.data(r.parent.options.api,r.parent.options.req);return r.data=e||{},{componentId:r.id,ssrId:r.ssrId,data:e}}),r.renderToHTML({ssrTree:r?.parent?.ssrTree,translations:r?.parent?.translations,walkingTreeForSSR:r?.parent?.walkingTreeForSSR,dataFromSSR:r?.parent?.dataFromSSR})}catch(e){a("component.renderMethods.component.collectDataFunctionsForSSR",e)}},jr=(r={})=>{try{let e={id:r.id,instanceId:r.instanceId,instance:r,children:[]};cr(r.parent.instanceId,e,r.parent&&r.parent.ssrTree||null)}catch(e){a("component.renderMethods.component.handleAddComponentToParent",e)}},Cr=(r={},e={})=>{try{!r.renderedComponent&&e.options&&e.options.lifecycle&&(e.options.lifecycle.onBeforeMount&&R("lifecycle.onBeforeMount",()=>{e.options.lifecycle.onBeforeMount(e)}),!r.renderedComponent&&e.options.lifecycle.onMount&&R("lifecycle.onMount",()=>{e.options.lifecycle.onMount(e)}))}catch(t){a("component.renderMethods.component.handleLifecycle",t)}},Dr=(r={},e={},t={})=>{try{!e.walkingTreeForSSR&&r?.options?.lifecycle?.onUpdateProps&&(0,dr.diff)(e?.existingPropsMap,t)?.length>0&&R("lifecycle.onUpdateProps",()=>{let o=e?.existingPropsMap&&e?.existingPropsMap[r.id];r.options.lifecycle.onUpdateProps(o||{},t,r)})}catch(n){a("component.renderMethods.component.handleOnChangeProps",n)}},Lr=function(){return function(e=null,t={},n={}){let o=e({props:t,existingStateMap:!n.walkingTreeForSSR&&n?.existingStateMap,url:n.url,translations:n.translations,api:n.options.api,req:n.options.req,dataFromSSR:n?.dataFromSSR});return o.parent=n,Dr(o,n,t),R("lifecycle.onMount",()=>{o.setDOMNodeOnInstance()}),Cr(this,o),jr(o),o.options.data&&o.parent.walkingTreeForSSR&&o.parent.ssrTree.dataFunctions?Ir(o):o.parent&&o.parent.ssrTree?Rr(o):kr(o,this)}},Ar=function(e,t){try{let n=this;return new Lr().bind({})(e,t,n)}catch(n){a("component.renderMethods.component",n)}},N=Ar;var Hr=function(e=[],t=null){try{return q(t)&&e&&Array.isArray(e)?e.map((n,o)=>t(n,o)).join(""):""}catch(n){a("component.renderMethods.each",n)}},P=Hr;var vr=function(e="",t={}){try{let n=O()?this.translations:window.__joystick_i18n__;if(!n||!n[e])return"";let o=Object.entries(t);return o.length>0?o.reduce((d,[T,y])=>d.replace(`{{${T}}}`,y),n[e]):n[e]}catch(n){a("component.renderMethods.i18n",n)}},_=vr;var Nr=function(e=!1,t=""){try{return this?.renderingHTMLWithDataForSSR||e?`<when>${t.trim()}</when>`:"<when> </when>"}catch(n){a("component.renderMethods.when",n)}},U=Nr;var pr={c:N,component:N,e:P,each:P,i:_,i18n:_,w:U,when:U};var rr=(r={},e={})=>{try{return Object.entries(pr).reduce((t,[n,o])=>(t[n]=o.bind({...r,...e}),t),{})}catch(t){a("component.renderMethods.compile",t)}};export{rr as default};
