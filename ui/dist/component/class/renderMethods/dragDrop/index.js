var s=(o="",e={})=>{throw new Error(`[joystick${o?`.${o}`:""}] ${e.message||e.reason||e}`)};var c=o=>{try{return typeof o=="function"}catch(e){s("types.isFunction",e)}};var h=o=>{try{return!!(o&&typeof o=="object"&&!Array.isArray(o))}catch(e){s("types.isObject",e)}};var m=()=>typeof window=="undefined";var l=(o={},e={})=>{Object.entries(o).forEach(([r,t])=>{e[r]=t})};var u="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890".split(""),y=(o=16)=>{let e="",r=0;for(;r<o;)e+=u[Math.floor(Math.random()*(u.length-1))],r+=1;return e};var b=(o={},e="",r="id")=>{try{let t=o&&o.id;if(h(o)&&t){let a=Object.keys(o);for(let n=0;n<a.length;n+=1){let i=a[n],d=o[i];if(i===r&&d===e)return o;if(i==="children"&&Array.isArray(d))for(let g=0;g<d.length;g+=1){let T=d[g],f=b(T,e,r);if(f!==null)return f}}}return null}catch(t){s("component.findComponentInTreeByField",t)}},p=b;var A=(o={},e="",r="",t={})=>{try{let a=null;o.dragDrop={...o.dragDrop||{},events:{...o.dragDrop?.events||{},[`drag [data-${e}="${r}"]`]:(n={},i={})=>{t?.events?.onDrag&&c(t.events.onDrag)&&t.events.onDrag(n,i)},[`dragend [data-${e}="${r}"]`]:(n={},i={})=>{e==="droppable"&&t.sortable&&(n.target.classList.remove("is-dragging"),a=null),t?.events?.onDragEnd&&c(t.events.onDragEnd)&&t.events.onDragEnd(n,i)},[`dragenter [data-${e}="${r}"]`]:(n={},i={})=>{t?.events?.onDragEnter&&c(t.events.onDragEnter)&&t.events.onDragEnter(n,i)},[`dragleave [data-${e}="${r}"]`]:(n={},i={})=>{t?.events?.onDragLeave&&c(t.events.onDragLeave)&&t.events.onDragLeave(n,i)},[`dragover [data-${e}="${r}"]`]:(n={},i={})=>{n.preventDefault(),e==="droppable"&&t.sortable&&(a.compareDocumentPosition(n.target)===Node.DOCUMENT_POSITION_PRECEDING?n.target.parentNode.insertBefore(a,n.target):n.target.parentNode.insertBefore(a,n.target.nextSibling)),t?.events?.onDragOver&&c(t.events.onDragOver)&&t.events.onDragOver(n,i)},[`dragstart [data-${e}="${r}"]`]:(n={},i={})=>{if(e==="droppable"&&t.sortable){n.dataTransfer.effectAllowed="move",a=n.target,n.target.classList.add("is-dragging"),n.dataTransfer.setData("text/plain",null);let d=new Image;d.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAADa6r/EAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=",n.dataTransfer.setDragImage(d,1,1)}t?.events?.onDragStart&&c(t.events.onDragStart)&&t.events.onDragStart(n,i)},[`drop [data-${e}="${r}"]`]:(n={},i={})=>{t?.events?.onDrop&&c(t.events.onDrop)&&t.events.onDrop(n,i)}}}}catch(a){s("component.renderMethods.dragDrop.attachEvents",a)}};var D=class{constructor(e={}){l(e,this)}initHTML(e=""){let r=document.createElement("div");r.innerHTML=e?.trim()?.replace(/\n/g,"");let t=r.childNodes;if(t?.length>0){for(let a=0;a<t?.length;a+=1){let n=t[a],i=this.id||y();n.setAttribute("draggable",!0),n.setAttribute("data-draggable",i),this.attachEvents(i,this.parent)}return r.innerHTML}}attachEvents(e="",r={}){let t=p(window.joystick._internal.tree,r.instanceId,"instanceId")?.instance||{};A(t,"draggable",e,{events:this.events})}},E=D;var x=class{constructor(e={}){l(e,this)}initHTML(e=""){let r=document.createElement("div");r.innerHTML=e?.trim()?.replace(/\n/g,"");let t=r.childNodes;if(t?.length>0){for(let a=0;a<t?.length;a+=1)t[a].setAttribute("data-droppable",this.name),this.attachEvents(this.name,this.parent);return r.innerHTML}}attachEvents(e="",r={}){let t=p(window.joystick._internal.tree,r.instanceId,"instanceId")?.instance||{};A(t,"droppable",e,{events:this.events,sortable:this.sortable})}},w=x;var I=function(o="",e={}){try{let r=new E({...e,origin:this.name,parent:this.parent});return m()?o:r.initHTML(o,e?.id)}catch(r){s("component.renderMethods.dragDrop.draggable",r)}},v=function(e="",r=null,t={}){try{let a=new w({name:e,parent:this,...t});if(!r||r&&!c(r))throw Error("Second argument to droppable must be a callback function returning HTML.");return m()?r(I.bind({name:e,parent:this})):a.initHTML(r(I.bind({name:e,parent:this})))}catch(a){s("component.renderMethods.dragDrop",a)}},ne=v;export{ne as default};
