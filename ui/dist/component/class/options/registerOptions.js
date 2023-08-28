var k="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890".split(""),$=(e=16)=>{let t="",r=0;for(;r<e;)t+=k[Math.floor(Math.random()*(k.length-1))],r+=1;return t};var d=(e="",t={})=>{throw new Error(`[joystick${e?`.${e}`:""}] ${t.message||t.reason||t}`)};var F=e=>{try{return typeof e=="undefined"}catch(t){d("types.isUndefined",t)}},M=e=>{try{return e===null}catch(t){d("types.isNull",t)}};var x=e=>{try{return!!Array.isArray(e)}catch(t){d("types.isArray",t)}};var f=e=>{try{return typeof e=="function"}catch(t){d("types.isFunction",t)}};var c=e=>{try{return!!(e&&typeof e=="object"&&!Array.isArray(e))}catch(t){d("types.isObject",t)}};var y=e=>{try{return typeof e=="string"}catch(t){d("types.isString",t)}};var L=(e=[],t="")=>{try{return(x(e)&&e.find(i=>i?.componentId===t))?.data||{}}catch(r){d("findComponentDataFromSSR",r)}};var C=(()=>{let e=0;return(t,r)=>{clearTimeout(e),e=setTimeout(t,r)}})();var w=e=>!!(e&&typeof e=="object"&&!Array.isArray(e));var R=e=>typeof e=="string";var Z=/^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/,v=(e,t="")=>{if(!t)return!0;if(t&&!R(t))return!1;let r=t?t.replace(/[- ]+/g,""):"";return e===!0?r.match(new RegExp(Z)):!r.match(new RegExp(Z))};var z=/^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/,V=(e,t="")=>e===!0?!!t.match(z):!t.match(z);var T=(e,t="")=>e===t;var D=(e,t="")=>e===t;var j=(e,t="")=>t.length<=e;var N=(e,t="")=>t.length>=e;var O=/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,U=(e,t="")=>e===!0?!!t.match(O):!t.match(O);var _={AF:/^\d{4}$/,AX:/^\d{5}$/,AL:/^\d{4}$/,DZ:/^\d{5}$/,AS:/^\d{5}(-{1}\d{4,6})$/,AD:/^[Aa][Dd]\d{3}$/,AI:/^[Aa][I][-][2][6][4][0]$/,AR:/^\d{4}|[A-Za-z]\d{4}[a-zA-Z]{3}$/,AM:/^\d{4}$/,AC:/^[Aa][Ss][Cc][Nn]\s{0,1}[1][Zz][Zz]$/,AU:/^\d{4}$/,AT:/^\d{4}$/,AZ:/^[Aa][Zz]\d{4}$/,BH:/^\d{3,4}$/,BD:/^\d{4}$/,BB:/^[Aa][Zz]\d{5}$/,BY:/^\d{6}$/,BE:/^\d{4}$/,BM:/^[A-Za-z]{2}\s([A-Za-z]{2}|\d{2})$/,BT:/^\d{5}$/,BO:/^\d{4}$/,BA:/^\d{5}$/,BR:/^\d{5}-\d{3}$/,"":/^[Bb][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,IO:/^[Bb]{2}[Nn][Dd]\s{0,1}[1][Zz]{2}$/,VG:/^[Vv][Gg]\d{4}$/,BN:/^[A-Za-z]{2}\d{4}$/,BG:/^\d{4}$/,KH:/^\d{5}$/,CA:/^(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\s{0,1}\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d$/,CV:/^\d{4}$/,KY:/^[Kk][Yy]\d[-\s]{0,1}\d{4}$/,TD:/^\d{5}$/,CL:/^\d{7}\s\(\d{3}-\d{4}\)$/,CN:/^\d{6}$/,CX:/^\d{4}$/,CC:/^\d{4}$/,CO:/^\d{6}$/,CD:/^[Cc][Dd]$/,CR:/^\d{4,5}$/,HR:/^\d{5}$/,CU:/^\d{5}$/,CY:/^\d{4}$/,CZ:/^\d{5}\s\(\d{3}\s\d{2}\)$/,DK:/^\d{4}$/,DO:/^\d{5}$/,EC:/^\d{6}$/,SV:/^1101$/,EG:/^\d{5}$/,EE:/^\d{5}$/,ET:/^\d{4}$/,FK:/^[Ff][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,FO:/^\d{3}$/,FI:/^\d{5}$/,FR:/^\d{5}$/,GF:/^973\d{2}$/,PF:/^987\d{2}$/,GA:/^\d{2}\s[a-zA-Z-_ ]\s\d{2}$/,GE:/^\d{4}$/,DE:/^\d{2}$/,GI:/^[Gg][Xx][1]{2}\s{0,1}[1][Aa]{2}$/,GR:/^\d{3}\s{0,1}\d{2}$/,GL:/^\d{4}$/,GP:/^971\d{2}$/,GU:/^\d{5}$/,GT:/^\d{5}$/,GG:/^[A-Za-z]{2}\d\s{0,1}\d[A-Za-z]{2}$/,GW:/^\d{4}$/,HT:/^\d{4}$/,HM:/^\d{4}$/,HN:/^\d{5}$/,HU:/^\d{4}$/,IS:/^\d{3}$/,IN:/^\d{6}$/,ID:/^\d{5}$/,IR:/^\d{5}-\d{5}$/,IQ:/^\d{5}$/,IM:/^[Ii[Mm]\d{1,2}\s\d\[A-Z]{2}$/,IL:/^\b\d{5}(\d{2})?$/,IT:/^\d{5}$/,JM:/^\d{2}$/,JP:/^\d{7}\s\(\d{3}-\d{4}\)$/,JE:/^[Jj][Ee]\d\s{0,1}\d[A-Za-z]{2}$/,JO:/^\d{5}$/,KZ:/^\d{6}$/,KE:/^\d{5}$/,KR:/^\d{6}\s\(\d{3}-\d{3}\)$/,XK:/^\d{5}$/,KW:/^\d{5}$/,KG:/^\d{6}$/,LV:/^[Ll][Vv][- ]{0,1}\d{4}$/,LA:/^\d{5}$/,LB:/^\d{4}\s{0,1}\d{4}$/,LS:/^\d{3}$/,LR:/^\d{4}$/,LY:/^\d{5}$/,LI:/^\d{4}$/,LT:/^[Ll][Tt][- ]{0,1}\d{5}$/,LU:/^\d{4}$/,MK:/^\d{4}$/,MG:/^\d{3}$/,MV:/^\d{4,5}$/,MY:/^\d{5}$/,MT:/^[A-Za-z]{3}\s{0,1}\d{4}$/,MH:/^\d{5}$/,MQ:/^972\d{2}$/,YT:/^976\d{2}$/,FM:/^\d{5}(-{1}\d{4})$/,MX:/^\d{5}$/,MD:/^[Mm][Dd][- ]{0,1}\d{4}$/,MC:/^980\d{2}$/,MN:/^\d{5}$/,ME:/^\d{5}$/,MS:/^[Mm][Ss][Rr]\s{0,1}\d{4}$/,MA:/^\d{5}$/,MZ:/^\d{4}$/,MM:/^\d{5}$/,NA:/^\d{5}$/,NP:/^\d{5}$/,NL:/^\d{4}\s{0,1}[A-Za-z]{2}$/,NC:/^988\d{2}$/,NZ:/^\d{4}$/,NI:/^\d{5}$/,NE:/^\d{4}$/,NG:/^\d{6}$/,NF:/^\d{4}$/,MP:/^\d{5}$/,NO:/^\d{4}$/,OM:/^\d{3}$/,PK:/^\d{5}$/,PW:/^\d{5}$/,PA:/^\d{6}$/,PG:/^\d{3}$/,PY:/^\d{4}$/,PE:/^\d{5}$/,PH:/^\d{4}$/,PN:/^[Pp][Cc][Rr][Nn]\s{0,1}[1][Zz]{2}$/,PL:/^\d{2}[- ]{0,1}\d{3}$/,PT:/^\d{4}$/,PR:/^\d{5}$/,RE:/^974\d{2}$/,RO:/^\d{6}$/,RU:/^\d{6}$/,BL:/^97133$/,SH:/^[Ss][Tt][Hh][Ll]\s{0,1}[1][Zz]{2}$/,MF:/^97150$/,PM:/^97500$/,VC:/^[Vv][Cc]\d{4}$/,SM:/^4789\d$/,SA:/^\d{5}(-{1}\d{4})?$/,SN:/^\d{5}$/,RS:/^\d{5}$/,SG:/^\d{2}$/,SK:/^\d{5}\s\(\d{3}\s\d{2}\)$/,SI:/^([Ss][Ii][- ]{0,1}){0,1}\d{4}$/,ZA:/^\d{4}$/,GS:/^[Ss][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,ES:/^\d{5}$/,LK:/^\d{5}$/,SD:/^\d{5}$/,SZ:/^[A-Za-z]\d{3}$/,SE:/^\d{3}\s*\d{2}$/,CH:/^\d{4}$/,SJ:/^\d{4}$/,TW:/^\d{5}$/,TJ:/^\d{6}$/,TH:/^\d{5}$/,TT:/^\d{6}$/,TN:/^\d{4}$/,TR:/^\d{5}$/,TM:/^\d{6}$/,TC:/^[Tt][Kk][Cc][Aa]\s{0,1}[1][Zz]{2}$/,UA:/^\d{5}$/,GB:/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z-[CIKMOV]]{2}/,US:/^\b\d{5}\b(?:[- ]{1}\d{4})?$/,UY:/^\d{5}$/,VI:/^\d{5}$/,UZ:/^\d{3} \d{3}$/,VA:/^120$/,VE:/^\d{4}(\s[a-zA-Z]{1})?$/,VN:/^\d{6}$/,WF:/^986\d{2}$/,ZM:/^\d{5}$/},P=(e,t="")=>{let r=w(e)&&e.iso?_[e.iso||"US"]:_.US;return w(e)?e.rule===!0?!!t.match(r):!t.match(r):e===!0?!!t.match(r):!t.match(r)};var B=(e,t="",r={isChecked:!1})=>{if(!r.isChecked)return e===!0?t&&t.trim()!=="":t&&t.trim()==="";if(r.isChecked)return e===!0?t:!t};var G=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,H=(e,t="")=>e===!0?!!t.match(G):!t.match(G);var q=/^[a-z0-9]+(?:-[a-z0-9]+)*$/,I=(e,t="")=>e===!0?!!t.match(q):!t.match(q);var K=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,W=(e,t="")=>e===!0?!!t.match(K):!t.match(K);var Y=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/,J=(e,t="")=>e===!0?!!t.match(Y):!t.match(Y);var Q={AT:/^(AT)(U\d{8}$)/i,BE:/^(BE)(\d{10}$)/i,BG:/^(BG)(\d{9,10}$)/i,CY:/^(CY)([0-5|9]\d{7}[A-Z]$)/i,CZ:/^(CZ)(\d{8,10})?$/i,DE:/^(DE)([1-9]\d{8}$)/i,DK:/^(DK)(\d{8}$)/i,EE:/^(EE)(10\d{7}$)/i,EL:/^(EL)(\d{9}$)/i,ES:/^(ES)([0-9A-Z][0-9]{7}[0-9A-Z]$)/i,EU:/^(EU)(\d{9}$)/i,FI:/^(FI)(\d{8}$)/i,FR:/^(FR)([0-9A-Z]{2}[0-9]{9}$)/i,GB:/^(GB)((?:[0-9]{12}|[0-9]{9}|(?:GD|HA)[0-9]{3})$)/i,GR:/^(GR)(\d{8,9}$)/i,HR:/^(HR)(\d{11}$)/i,HU:/^(HU)(\d{8}$)/i,IE:/^(IE)([0-9A-Z\*\+]{7}[A-Z]{1,2}$)/i,IT:/^(IT)(\d{11}$)/i,LV:/^(LV)(\d{11}$)/i,LT:/^(LT)(\d{9}$|\d{12}$)/i,LU:/^(LU)(\d{8}$)/i,MT:/^(MT)([1-9]\d{7}$)/i,NL:/^(NL)(\d{9}B\d{2}$)/i,NO:/^(NO)(\d{9}$)/i,PL:/^(PL)(\d{10}$)/i,PT:/^(PT)(\d{9}$)/i,RO:/^(RO)([1-9]\d{1,9}$)/i,RU:/^(RU)(\d{10}$|\d{12}$)/i,RS:/^(RS)(\d{9}$)/i,SI:/^(SI)([1-9]\d{7}$)/i,SK:/^(SK)([1-9]\d[(2-4)|(6-9)]\d{7}$)/i,SE:/^(SE)(\d{10}01$)/i},X=(e,t="")=>{let r=w(e)&&e.iso?Q[e.iso||"EU"]:Q.EU;return w(e)?e.rule===!0?!!t.match(r):!t.match(r):e===!0?!!t.match(r):!t.match(r)};var ee={creditCard:v,email:V,equals:T,matches:D,maxLength:j,minLength:N,phone:U,postalCode:P,required:B,semVer:H,slug:I,strongPassword:W,url:J,vat:X};var te=class{constructor(t,r={}){this.fieldsToListenToForChanges=["checkbox","color","date","datetime-local","email","file","hidden","month","number","password","radio","range","search","tel","text","time","url","week"],this.defaultValidationErrors={required:()=>"This field is required.",email:()=>"Must be a valid email.",creditCard:()=>"Must be a valid credit card number.",equals:i=>`Value must equal ${i}.`,matches:i=>`Field must match ${i}.`,maxLength:i=>`Field value can be no greater than ${i}.`,minLength:i=>`Field value can be no less than ${i}.`,phone:()=>"Field value must be a valid telephone number.",postalCode:()=>"Field value must be a valid postal code.",semVer:()=>"Field value must be a valid semantic version.",slug:()=>"Field value must be a valid URL slug.",strongPassword:()=>"Field value must be a valid password.",url:()=>"Field value must be a valid URL.",vat:()=>"Field value must be a valid VAT code."},t||console.warn("[validateForm] Must pass an HTML <form></form> element to validate."),this.form=t,this.setOptions(r),this.attachEventListeners()}setOptions(t={}){this.rules=t.rules||{},this.messages=t.messages||{},this.onSubmit=t.onSubmit,this.fields=this.serialize()}updateOptions(t={}){this.setOptions(t)}serialize(){if(this.form)return Object.keys(this.rules).map(r=>{let i=this.form.querySelector(`[name="${r}"]`),o=i?.type;return{listenForChanges:this.fieldsToListenToForChanges.includes(o),type:o,name:r,element:i,validations:Object.entries(this.rules[r]).map(([n,a])=>({name:n,rule:a,valid:!1})).sort((n,a)=>n.name>a.name?1:-1),errorMessages:this.messages[r]?Object.keys(this.messages[r]):{}}})}attachEventListeners(){if(this.form){let t=r=>{r.stopPropagation(),r.preventDefault(),this.validate()&&this.onSubmit&&this.onSubmit()};if(this.form.listeners?.length>0)for(let r=0;r<this.form.listeners.length;r+=1){let i=this.form.listeners[r];this.form.removeEventListener("submit",i)}this.form.addEventListener("submit",t),this.form.listeners=[...this.form.listeners||[],t]}this.fields.forEach(t=>{if(t?.element&&t?.listenForChanges){let r=()=>{C(()=>{this.validate(t.name)},100)};t.element.removeEventListener("input",r),t.element.addEventListener("input",r),t.element.removeEventListener("change",r),t.element.addEventListener("change",r)}})}validate(t=null){if(t){this.clearExistingErrors();let r=this.fields.find(i=>i.name===t);return this.validateField(r),this.checkIfValid()}else return this.clearExistingErrors(),this.fields.forEach(r=>{this.validateField(r)}),this.checkIfValid()}checkIfValid(){return!this.fields.map(r=>r.validations.some(i=>!i.valid)).includes(!0)}validateField(t){let r=this.form.querySelector(`[name="${t.name}"]`),i=["checkbox","radio"].includes(t.type),o=i?null:t?.element?.value?.trim(),s=i?t?.element?.checked:null;t.validations.forEach(a=>{if(this.isValidValue(i,i?s:o,a))this.markValidationAsValid(t,a.name);else{let b=this.messages[t.name]&&this.messages[t.name][a.name];this.markValidationAsInvalid(t,a.name),this.renderError(t.element,b||this.defaultValidationErrors[a.name](a.rule,o))}});let n=t.validations.some(a=>!a.valid);return n&&(r.classList.add("error"),r.focus()),n||(r.classList.remove("error"),this.clearExistingError(t.name)),!n}markValidationAsInvalid(t,r){let o=[...t.validations].find(s=>s.name===r);o.valid=!1}markValidationAsValid(t,r){let o=[...t.validations].find(s=>s.name===r);o.valid=!0}isValidValue(t,r,i){let o=ee[i.name];return o?o(i.rule,r,{isChecked:t}):!0}clearExistingErrors(){this.form&&this.form.querySelectorAll(".input-hint.error").forEach(t=>t.remove())}clearExistingError(t=""){let r=document.getElementById(`error-${t}`);r&&r.remove()}renderError(t,r=""){if(t){this.clearExistingError(t.name);let i=document.createElement("p");i.classList.add("input-hint"),i.classList.add("error"),i.setAttribute("id",`error-${t.name}`),i.innerText=r,t.after(i)}}},$e=(e,t)=>new Promise((r,i)=>{try{new te(e,t).validate()?r():i()}catch(o){console.warn(o)}}),re=$e;var ie=(e={},t={})=>{try{return[...Object.keys(t),...Object.keys(e)].filter((i,o,s)=>s.indexOf(i)===o).reduce((i,o)=>{let s=t[o],n=e[o]||null,a=!F(s)&&!M(s);return i[o]=a?s:n,i},{})}catch(r){d("component.props.compile",r)}};var oe=(e="",t={})=>{try{let r="";if(e&&y(e))return r=e,r;if(e&&f(e))return r=e(t),r;if(e&&c(e)){let i=e?.print&&(y(e?.print)||f(e?.print)),o=e?.min&&c(e?.min),s=e?.min?.width&&c(e?.min?.width),n=e?.min?.height&&c(e?.min?.height),a=e?.max&&c(e?.max),b=e?.max?.width&&c(e?.max?.width),ue=e?.max?.height&&c(e?.max?.height);if(i&&(r+=`
          @media print {
            ${typeof e?.print=="function"?e?.print(t):e.print}
          }
        `),o&&s){let u=Object.entries(e?.min?.width);for(let l=0;l<u.length;l+=1){let[h,m]=u[l];r+=`
            @media screen and (min-width: ${h}px) {
              ${typeof m=="function"?m(t):m}
            }
          `}}if(o&&n){let u=Object.entries(e?.min?.height);for(let l=0;l<u.length;l+=1){let[h,m]=u[l];r+=`
            @media screen and (min-height: ${h}px) {
              ${typeof m=="function"?m(t):m}
            }
          `}}if(a&&b){let u=Object.entries(e?.max?.width);for(let l=0;l<u.length;l+=1){let[h,m]=u[l];r+=`
            @media screen and (max-width: ${h}px) {
              ${typeof m=="function"?m(t):m}
            }
          `}}if(a&&ue){let u=Object.entries(e?.max?.height);for(let l=0;l<u.length;l+=1){let[h,m]=u[l];r+=`
            @media screen and (max-height: ${h}px) {
              ${typeof m=="function"?m(t):m}
            }
          `}}return r}return""}catch(r){d("component.css.compileCSS",r)}};var fe=(e={},t=null)=>{try{let r=t(e);return r&&c(r)&&!x(r)?Object.assign({},r):{}}catch(r){d("component.state.compile.compileState",r)}},se=(e={},t={})=>{try{return f(t)?fe(e,t):Object.assign({},t)}catch(r){d("component.state.compile",r)}};var A={onBeforeMount:()=>null,onMount:()=>null,onBeforeUnmount:()=>null,onUpdateProps:()=>null,onRefetchData:()=>null};var de=(e={},t={})=>{try{return t?Object.entries({...A,...t||{}}).reduce((r={},[i,o])=>(r[i]=()=>o({...e,setState:e.setState.bind(e),...e.renderMethods||{}}),r),{}):A}catch(r){d("component.lifecycle.compile",r)}};var p=(e="",t=[])=>{typeof window!="undefined"&&!!window.__joystick_test__&&(window.test={...window.test||{},functionCalls:{...window?.test?.functionCalls||{},[e]:[...window?.test?.functionCalls&&window?.test?.functionCalls[e]||[],{calledAt:new Date().toISOString(),args:t}]}})};var ae=(e={},t={})=>{try{return Object.entries(t).reduce((r={},[i,o])=>(r[i]=(...s)=>(p(`ui.${e?.options?.test?.name||$()}.methods.${i}`,[...s,{...e,setState:e.setState.bind(e),...e.renderMethods||{}}]),o(...s,{...e,setState:e.setState.bind(e),...e.renderMethods||{}})),r),{})}catch{d("component.methods.compile")}};var S=(e={})=>{try{return{...e,query:{...e?.query||{},set:(t="",r="")=>{if(typeof window!="undefined"){let i=new URL(window.location);i.searchParams.append(t,r),window.history.pushState({},"",i)}},unset:(t="")=>{if(typeof window!="undefined"){let r=new URL(window.location);r.searchParams.delete(t),window.history.pushState({},"",r)}}},isActive:(t="")=>y(t)&&e?.route!=="*"?t===(typeof location!="undefined"?location.pathname:e.path):!1}}catch(t){d("component.url.compile",t)}};var ne=()=>typeof window=="undefined";var g=null,E=0,le=(e={},t=null)=>{try{if(window?.__joystick_test__)return t();let r=e?.url;e?.query&&(r=`${r}?${new URLSearchParams(e.query).toString()}`);let i=new WebSocket(r);g&&(clearInterval(g),g=null);let o={client:i,send:(s={})=>(p(`ui.websockets.${e?.test?.name||$()}.send`,[s]),i.send(JSON.stringify(s)))};return i.addEventListener("open",()=>{e?.options?.logging&&console.log(`[joystick.websockets] Connected to ${e?.url}`),e?.events?.onOpen&&(e.events.onOpen(o),p(`ui.websockets.${e?.test?.name||$()}.onOpen`,[o])),E=0}),i.addEventListener("message",s=>{s?.data&&e?.events?.onMessage&&(e.events.onMessage(JSON.parse(s.data||{}),o),p(`ui.websockets.${e?.test?.name||$()}.onMessage`,[s.data||{},o]))}),i.addEventListener("close",s=>{e?.options?.logging&&console.log(`[joystick.websockets] Disconnected from ${e?.url}`),e?.events?.onClose&&(e.events.onClose(s?.code,s?.reason,o),p(`ui.websockets.${e?.test?.name||$()}.onClose`,[s.data||{},o])),i=null;let n=[1e3,1001].includes(s?.code);e?.options?.autoReconnect&&!g&&!n&&(g=setInterval(()=>{i=null,E<(e?.options?.reconnectAttempts||12)?(le(e,t),e?.options?.logging&&console.log(`[joystick.websockets] Attempting to reconnect (${E+1}/12)...`),E+=1):clearInterval(g)},e?.options?.reconnectDelayInSeconds*1e3||5e3))}),t&&t(o),o}catch(r){d("websockets.client",r)}},me=le;var he=(e={},t=null)=>{try{let r=t(e);return r&&c(r)&&!x(r)?Object.assign({},r):{}}catch(r){d("component.props.compileDefaultProps.compile",r)}},ce=(e={},t={})=>{try{return f(t)?he(e,t):Object.assign({},t)}catch(r){d("component.props.compileDefaultProps",r)}};var Wt=(e={},t={})=>{try{e.options=t||{},e.id=t?._componentId||null,e.instanceId=$(8),e.ssrId=t?._ssrId||null,e.css=oe(),e.data=L(t?.dataFromSSR,t?._componentId),e.defaultProps=ce(e,t?.defaultProps),e.props=ie(e?.defaultProps,t?.props),e.state=se(e,t?.state),e.events=t?.events||{},e.lifecycle=de(e,t?.lifecycle),e.methods=ae(e,t?.methods),e.wrapper=t?.wrapper||{},e.translations=t?.translations||{},e.validateForm=re,e.DOMNode=null,e.dom={},e.dom.virtual={},e.dom.actual={};let r=!ne();if(r||(e.url=S(t?.url)),r&&window.__joystick_url__&&(e.url=S(window.__joystick_url__)),r&&window.__joystick_user__&&(e.user=window.__joystick_user__),r&&t?.websockets&&f(t?.websockets)){let i=t.websockets(e),o=c(i)&&Object.entries(i);for(let s=0;s<o?.length;s+=1){let[n,a]=o[s];me({test:e?.test,url:`${window?.process?.env.NODE_ENV==="development"?"ws":"wss"}://${location.host}/api/_websockets/${n}`,options:a?.options||{},query:a?.query||{},events:a?.events||{}},(b={})=>{e.websockets={...e.websockets||{},[n]:b}})}}}catch(r){d("component.registerOptions",r)}};export{Wt as default};
