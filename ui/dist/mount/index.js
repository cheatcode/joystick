var Me=Object.create;var U=Object.defineProperty;var ge=Object.getOwnPropertyDescriptor;var Te=Object.getOwnPropertyNames;var Fe=Object.getPrototypeOf,Se=Object.prototype.hasOwnProperty;var Ee=e=>U(e,"__esModule",{value:!0});var be=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var Oe=(e,t,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of Te(t))!Se.call(e,n)&&n!=="default"&&U(e,n,{get:()=>t[n],enumerable:!(r=ge(t,n))||r.enumerable});return e},ke=e=>Oe(Ee(U(e!=null?Me(Fe(e)):{},"default",e&&e.__esModule&&"default"in e?{get:()=>e.default,enumerable:!0}:{value:e,enumerable:!0})),e);var Z=be(D=>{(function(e,t){if(typeof define=="function"&&define.amd)define(["exports"],t);else if(typeof D!="undefined")t(D);else{var r={exports:{}};t(r.exports),e.index=r.exports}})(D,function(e){"use strict";function t(a){return t=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(s){return typeof s}:function(s){return s&&typeof Symbol=="function"&&s.constructor===Symbol&&s!==Symbol.prototype?"symbol":typeof s},t(a)}function r(a,s){return s&&(t(s)==="object"||typeof s=="function")?s:n(a)}function n(a){if(a===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function o(a){return o=Object.setPrototypeOf?Object.getPrototypeOf:function(s){return s.__proto__||Object.getPrototypeOf(s)},o(a)}function c(a,s){if(typeof s!="function"&&s!==null)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(s&&s.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),s&&y(a,s)}function y(a,s){return y=Object.setPrototypeOf||function(l,g){return l.__proto__=g,l},y(a,s)}function x(a,s){if(!(a instanceof s))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0}),e.diff=void 0;var M=function a(s,l){x(this,a),this.type=s,this.path=l?l.toString():""},R=function(a){function s(l,g,d){var S;return x(this,s),S=r(this,o(s).call(this,"E",l)),S.lhs=g,S.rhs=d,S}return c(s,a),s}(M),L=function(a){function s(l,g,d,S){var u;return x(this,s),u=r(this,o(s).call(this,"M",l)),u.item=g,u.lhsIndex=d,u.rhsIndex=S,u}return c(s,a),s}(M),_=function(a){function s(l,g){var d;return x(this,s),d=r(this,o(s).call(this,"D",l)),d.lhs=g,d}return c(s,a),s}(M),N=function(a){function s(l,g){var d;return x(this,s),d=r(this,o(s).call(this,"A",l)),d.rhs=g,d}return c(s,a),s}(M),b=function(a,s){return a?"".concat(a,".").concat(s):s};e.diff=function(s,l){var g=2<arguments.length&&arguments[2]!==void 0?arguments[2]:{},d=[],S=g.matchKey,u=g.types||["E","A","D","M"],xe=function(f,p,m,O){f.forEach(function(E,h){var T=p.findIndex(function(w){return w[O]===E[O]});-1<T?(-1<u.indexOf("M")&&h!==T&&d.push(new L(m,E,h,T)),v(E,p[T],b(m,T))):-1<u.indexOf("D")&&d.push(new _(m,E))}),p.forEach(function(E,h){var T=f.findIndex(function(w){return E[O]===w[O]});-1<u.indexOf("A")&&T===-1&&d.push(new N(b(m,h),E))})},v=function(f,p,m){var O=Object.prototype.toString.call(f),E=Object.prototype.toString.call(p);if(-1<u.indexOf("E")&&O!==E)return d.push(new R(m,f,p)),!1;if(O==="[object Object]")Object.getOwnPropertyNames(f).forEach(function(w){Object.prototype.hasOwnProperty.call(p,w)?v(f[w],p[w],b(m,w)):-1<u.indexOf("D")&&d.push(new _(b(m,w),f[w]))}),Object.getOwnPropertyNames(p).forEach(function(w){-1<u.indexOf("A")&&!Object.prototype.hasOwnProperty.call(f,w)&&d.push(new N(b(m,w),p[w]))});else if(O!=="[object Array]")-1<u.indexOf("E")&&f!==p&&d.push(new R(m,f,p));else if(S)xe(f,p,m,S);else{var h=f.length-1,T=p.length-1;if(-1<u.indexOf("D"))for(;h>T;)d.push(new _(b(m,h),f[h--]));if(-1<u.indexOf("A"))for(;T>h;)d.push(new N(b(m,T),p[T--]));for(;0<=h;--h)v(f[h],p[h],b(m,h))}};return v(s,l),d}})});var i=(e="",t={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${t.message||t.reason||t}`)};var G=e=>{try{return e instanceof Element}catch(t){i("types.isDOM",t)}},J=e=>{try{return!!Array.isArray(e)}catch(t){i("types.isArray",t)}};var k=e=>{try{return typeof e=="function"}catch(t){i("types.isFunction",t)}};var C=e=>{try{return!!(e&&typeof e=="object"&&!Array.isArray(e))}catch(t){i("types.isObject",t)}};var V=e=>{try{return typeof e=="string"}catch(t){i("types.isString",t)}};var K=(e={})=>{try{window.joystick._internal.tree={id:e?.id||null,instanceId:e?.instanceId||null,instance:e,children:[]}}catch(t){i("mount.initializeJoystickComponentTree",t)}};var F=()=>typeof window=="undefined";var Ie=(e="")=>{try{let[t,r]=e?.split(".");return r?window?.joystick?._internal?.queues[t][r]:window?.joystick?._internal?.queues[t]}catch(t){i("processQueue.getQueue",t)}},B=(e="",t=null)=>{try{F()||(Ie(e)||{}).process(t)}catch(r){i("processQueue",r)}};var X=(e={},t=null)=>{try{return e.innerHTML="",e.appendChild(t),t}catch(r){i("mount.appendToDOM",r)}};var Y=(e={})=>{try{return Object.entries(e).map(([t,r])=>{let[n,...o]=t.split(" ");return{type:n.toLowerCase(),selector:o.join(" "),handler:r}})}catch(t){i("component.events.serialize",t)}};var me=ke(Z());var je=(e="")=>{try{let[t,r]=e?.split(".");return r?window?.joystick?._internal?.queues[t][r]:window?.joystick?._internal?.queues[t]}catch(t){i("addToQueue.getQueue",t)}},j=(e="",t=null)=>{try{F()||(je(e)||{}).array.push({callback:t})}catch(r){i("addToQueue",r)}};var ee=(e=[],t="")=>{try{return(J(e)&&e.find(n=>n?.componentId===t))?.data||{}}catch(r){i("findComponentDataFromSSR",r)}};var te=(e={},t="",r="id")=>{try{let n=e&&e.id;if(C(e)&&n){let o=Object.keys(e);for(let c=0;c<o.length;c+=1){let y=o[c],x=e[y];if(y===r&&x===t)return e;if(y==="children"&&Array.isArray(x))for(let M=0;M<x.length;M+=1){let R=x[M],L=te(R,t,r);if(L!==null)return L}}}return null}catch(n){i("component.findComponentInTreeByField",n)}},I=te;var A=(e={})=>{try{let t={},r=I(window.joystick._internal.tree,e.instanceId);return r&&(t[r?.instance?.instanceId]=r?.instance?.props),r?.children?.reduce((n={},o)=>(n[o?.instance?.instanceId]||(n[o?.instance?.instanceId]=o?.instance?.props),n),t)}catch(t){i("component.render.getExistingPropsMap",t)}};var H=(e={})=>{try{let t={},r=I(window.joystick._internal.tree,e.instanceId);return r&&(t[r?.instance?.instanceId]=r?.instance?.state),r?.children?.reduce((n={},o)=>(n[o?.instance?.instanceId]||(n[o?.instance?.instanceId]=o?.instance?.state),n),t)}catch(t){i("component.render.getExistingStateMap",t)}};var re=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),Re=new RegExp(/\n/g);var Le=(e="")=>{try{return(e.match(re)||[]).forEach(r=>{e=e.replace(r,"")}),e}catch(t){i("component.render.sanitizeHTML.removeCommentedCode",t)}},ne=(e="")=>{try{let t=`${e}`;return t=Le(t),t}catch(t){i("component.render.sanitizeHTML",t)}};var oe=(e={},t="")=>{try{let{wrapper:r=null,ssrId:n=null,id:o=null,instanceId:c=null}=e;return`<div ${r?.id?`id="${r.id}" `:""}${r?.classList?`class="${r.classList?.join(" ")}" `:""}js-ssrId="${n}" js-c="${o}" js-i="${c}">${t}</div>`}catch(r){i("component.render.wrapHTML",r)}};var ie=(e={},t={})=>{try{t?.dataFromSSR&&(e.data=ee(t.dataFromSSR,e.id)||{});let r=P({...e,getExistingPropsMap:{},existingPropsMap:F()?{}:A(e),existingStateMap:F()?{}:H(e),ssrTree:t?.ssrTree,translations:t?.translations||e.translations||{},walkingTreeForSSR:t?.walkingTreeForSSR,renderingHTMLWithDataForSSR:t?.renderingHTMLWithDataForSSR,dataFromSSR:t?.dataFromSSR}),n=e.options.render({...e||{},setState:e.setState.bind(e),...r||{}}),o=ne(n),c=oe(e,o);return{unwrapped:o,wrapped:c}}catch(r){i("component.render.toHTML",r)}};var ve=(e={})=>{try{return Object.values(e).reduce((t={},r)=>(t[r.name]=r.value,t),{})}catch(t){i("component.virtualDOM.build.parseAttributeMap",t)}},se=(e={})=>{try{return e.tagName==="WHEN"?[].flatMap.call(e?.childNodes,t=>t?.tagName==="WHEN"?se(t):q(t)):q(e)}catch(t){i("component.virtualDOM.build.flattenWhenTags",t)}},q=(e={})=>{try{let t=e&&e.tagName&&e.tagName.toLowerCase()||"text",r={tagName:t,attributes:ve(e.attributes),children:[].flatMap.call(e.childNodes,n=>se(n))};return t==="text"&&(r=e.textContent),r}catch(t){i("component.virtualDOM.build",t)}},ae=q;var Ce=(e="",t="")=>{try{let r=document.createElement("div");return r.setAttribute("js-c",t),r.innerHTML=e,r}catch(r){i("component.virtualDOM.build.convertHTMLToDOM",r)}},ce=(e="",t="")=>{try{let r=Ce(e,t);return ae(r)}catch(r){i("component.virtualDOM.build",r)}};var de=(e="")=>{try{return document.createElement("div").setAttribute(e,"Test"),!0}catch{return!1}};var De=(e={})=>{try{let t=document.createElement(e.tagName),r=Object.entries(e.attributes);for(let n=0;n<r.length;n+=1){let[o,c]=r[n];de(o)&&t.setAttribute(o,c)}for(let n=0;n<e?.children?.length;n+=1){let o=e?.children[n];if(o){let c=pe(o);t.appendChild(c)}}return t}catch(t){i("component.virtualDOM.renderTreeToDOM.renderElement",t)}},pe=(e=null)=>{try{return V(e)?document.createTextNode(e):De(e)}catch(t){i("component.virtualDOM.renderTreeToDOM",t)}},le=pe;var ue=(e={},t={})=>{try{let r=ie(e),n=ce(r.unwrapped,e.id),o=t.includeActual&&n?le(n):null;return{html:r,virtual:n,actual:o}}catch(r){i("component.render.getUpdatedDOM",r)}};var fe=(e="",t={},r=null)=>{let n=I(r||window.joystick._internal.tree,e,"instanceId");n&&(n.children=[...n.children||[],t])};var Ae=(e={},t={})=>{try{let r=ue(e,{includeActual:!0});return e.dom=r,e.setDOMNodeOnInstance(),e.appendCSSToHead(),t.renderedComponent=e,r.html.wrapped}catch(r){i("component.renderMethods.component.renderForClient",r)}},He=(e={})=>{try{return e.renderToHTML({ssrTree:e.parent.ssrTree,translations:e.parent.translations,walkingTreeForSSR:e?.parent?.walkingTreeForSSR,dataFromSSR:e.parent?.dataFromSSR}).wrapped}catch(t){i("component.renderMethods.component.renderToHTMLForSSR",t)}},Pe=(e={})=>{try{return e.parent.ssrTree.dataFunctions.push(async()=>{let t=await e.options.data(e.parent.options.api,e.parent.options.req);return e.data=t||{},{componentId:e.id,ssrId:e.ssrId,data:t}}),e.renderToHTML({ssrTree:e?.parent?.ssrTree,translations:e?.parent?.translations,walkingTreeForSSR:e?.parent?.walkingTreeForSSR,dataFromSSR:e?.parent?.dataFromSSR})}catch(t){i("component.renderMethods.component.collectDataFunctionsForSSR",t)}},_e=(e={})=>{try{let t={id:e.id,instanceId:e.instanceId,instance:e,children:[]};fe(e.parent.instanceId,t,e.parent&&e.parent.ssrTree||null)}catch(t){i("component.renderMethods.component.handleAddComponentToParent",t)}},Ne=(e={},t={})=>{try{!e.renderedComponent&&t.options&&t.options.lifecycle&&(t.options.lifecycle.onBeforeMount&&j("lifecycle.onBeforeMount",()=>{t.options.lifecycle.onBeforeMount(t)}),!e.renderedComponent&&t.options.lifecycle.onMount&&j("lifecycle.onMount",()=>{t.options.lifecycle.onMount(t)}))}catch(r){i("component.renderMethods.component.handleLifecycle",r)}},Ue=(e={},t={},r={})=>{try{!t.walkingTreeForSSR&&e?.options?.lifecycle?.onUpdateProps&&(0,me.diff)(t?.existingPropsMap,r)?.length>0&&j("lifecycle.onUpdateProps",()=>{let o=t?.existingPropsMap&&t?.existingPropsMap[e.id];e.options.lifecycle.onUpdateProps(o||{},r,e)})}catch(n){i("component.renderMethods.component.handleOnChangeProps",n)}},Be=function(){return function(t=null,r={},n={}){let o=t({props:r,existingStateMap:!n.walkingTreeForSSR&&n?.existingStateMap,url:n.url,translations:n.translations,api:n.options.api,req:n.options.req,dataFromSSR:n?.dataFromSSR,parent:n});return o.parent=n,Ue(o,n,r),j("lifecycle.onMount",()=>{o.setDOMNodeOnInstance()}),Ne(this,o),o.parent&&_e(o),o.options.data&&o.parent.walkingTreeForSSR&&o.parent.ssrTree.dataFunctions?Pe(o):o.parent&&o.parent.ssrTree?He(o):Ae(o,this)}},qe=function(t,r){try{let n=this;return new Be().bind({})(t,r,n)}catch(n){i("component.renderMethods.component",n)}},$=qe;var $e=function(t=[],r=null){try{return k(r)&&t&&Array.isArray(t)?t.map((n,o)=>r(n,o)).join(""):""}catch(n){i("component.renderMethods.each",n)}},z=$e;var ze=function(t="",r={}){try{let n=F()?this.translations:window.__joystick_i18n__;if(!n||!n[t])return"";let o=Object.entries(r);return o.length>0?o.reduce((c,[y,x])=>c.replace(`{{${y}}}`,x),n[t]):n[t]}catch(n){i("component.renderMethods.i18n",n)}},Q=ze;var Qe=function(t=!1,r=""){try{return this?.renderingHTMLWithDataForSSR||t?`<when>${r.trim()}</when>`:"<when> </when>"}catch(n){i("component.renderMethods.when",n)}},W=Qe;var he={c:$,component:$,e:z,each:z,i:Q,i18n:Q,w:W,when:W};var P=(e={},t={})=>{try{return Object.entries(he).reduce((r,[n,o])=>(r[n]=o.bind({...e,...t}),r),{})}catch(r){i("component.renderMethods.compile",r)}};var We=(e={})=>{try{if(e.lifecycle&&e.lifecycle.onBeforeUnmount&&k(e.lifecycle.onBeforeUnmount)){let t=function(){e.lifecycle.onBeforeUnmount(e)};window.removeEventListener("beforeunload",t),window.addEventListener("beforeunload",t)}}catch(t){i("component.events.registerListeners.attachOnBeforeUnmount",t)}},we=(e={},t=[])=>{let r=e.instance.options.events||{},n=Object.keys(r).length>0;if(We(e.instance),n){let o=P({...e?.instance,getExistingPropsMap:{},existingPropsMap:F()?{}:A(e?.instance),existingStateMap:F()?{}:H(e?.instance),ssrTree:e?.instance?.parent?.ssrTree,translations:e?.instance?.parent?.translations||e?.instance.translations||{},walkingTreeForSSR:e?.instance?.parent?.walkingTreeForSSR,renderingHTMLWithDataForSSR:e?.instance?.parent?.renderingHTMLWithDataForSSR,dataFromSSR:e?.instance?.parent?.dataFromSSR});t.push({id:e.id,instanceId:e.instance.instanceId,events:Y(r).map(c=>{let y=document.querySelectorAll(`body [js-i="${e.instance.instanceId}"] ${c.selector}`);return{...c,eventListener:function(M){Object.defineProperty(M,"target",{value:M.composedPath()[0]}),c.handler(M,{...e.instance||{},setState:e?.instance?.setState.bind(e.instance),...o||{}})},elements:y?.length>0?y:[]}}),instance:e.instance})}if(e?.children?.length>0)for(let o=0;o<e?.children?.length;o+=1){let c=e?.children[o];we(c,t)}return t},ye=()=>{setTimeout(()=>{let e=we(window.joystick._internal.tree,[]);for(let t=0;t<e?.length;t+=1){let r=e[t];for(let n=0;n<r?.events?.length;n+=1){let o=r.events[n];for(let c=0;c<o?.elements?.length;c+=1)o.elements[c].addEventListener(o.type,o.eventListener)}}window.joystick._internal.eventListeners=e},0)};var Ur=(e=null,t={},r=null)=>{try{k(e)||i("mount","Component to mount must be a function."),C(t)||i("mount","props must be an object."),G(r)||i("mount","target must be a DOM node.");let n=e({props:t});K(n);let o=n.render({mounting:!0});o&&(o.setAttribute("js-ssrId",n.ssrId),o.setAttribute("js-c",n.id),o.setAttribute("js-i",n.instanceId)),n.lifecycle.onBeforeMount(),B("lifecycle.onBeforeMount"),X(r,o),n.setDOMNodeOnInstance(),n.appendCSSToHead(),ye(),n.lifecycle.onMount(),B("lifecycle.onMount")}catch(n){i("mount",n)}};export{Ur as default};
