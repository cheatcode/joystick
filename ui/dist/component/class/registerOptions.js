var Ee=Object.create;var Z=Object.defineProperty;var Se=Object.getOwnPropertyDescriptor;var Ce=Object.getOwnPropertyNames;var be=Object.getPrototypeOf,ve=Object.prototype.hasOwnProperty;var Fe=r=>Z(r,"__esModule",{value:!0});var Re=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var Me=(r,e,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Ce(e))!ve.call(r,s)&&s!=="default"&&Z(r,s,{get:()=>e[s],enumerable:!(n=Se(e,s))||n.enumerable});return r},Ze=r=>Me(Fe(Z(r!=null?Ee(be(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);var we=Re((v,ye)=>{var z=[].slice;(function(r,e){return typeof define=="function"&&define.amd!=null?define([],e):typeof v!="undefined"&&v!==null?ye.exports=e():r.UrlPattern=e()})(v,function(){var r,e,n,s,l,f,$,c,y,g,F,R,M,E,w;return y=function(i){return i.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")},$=function(i,t){var a,o,d;for(d=[],a=-1,o=i.length;++a<o;)d=d.concat(t(i[a]));return d},E=function(i,t){var a,o,d;for(d="",a=-1,o=i.length;++a<o;)d+=t(i[a]);return d},M=function(i){return new RegExp(i.toString()+"|").exec("").length-1},F=function(i,t){var a,o,d,u,h;for(u={},a=-1,d=i.length;++a<d;)o=i[a],h=t[a],h!=null&&(u[o]!=null?(Array.isArray(u[o])||(u[o]=[u[o]]),u[o].push(h)):u[o]=h);return u},r={},r.Result=function(i,t){this.value=i,this.rest=t},r.Tagged=function(i,t){this.tag=i,this.value=t},r.tag=function(i,t){return function(a){var o,d;if(o=t(a),o!=null)return d=new r.Tagged(i,o.value),new r.Result(d,o.rest)}},r.regex=function(i){return function(t){var a,o;if(a=i.exec(t),a!=null)return o=a[0],new r.Result(o,t.slice(o.length))}},r.sequence=function(){var i;return i=1<=arguments.length?z.call(arguments,0):[],function(t){var a,o,d,u,h,p;for(a=-1,o=i.length,p=[],u=t;++a<o;){if(d=i[a],h=d(u),h==null)return;p.push(h.value),u=h.rest}return new r.Result(p,u)}},r.pick=function(){var i,t;return i=arguments[0],t=2<=arguments.length?z.call(arguments,1):[],function(a){var o,d;if(d=r.sequence.apply(r,t)(a),d!=null)return o=d.value,d.value=o[i],d}},r.string=function(i){var t;return t=i.length,function(a){if(a.slice(0,t)===i)return new r.Result(i,a.slice(t))}},r.lazy=function(i){var t;return t=null,function(a){return t==null&&(t=i()),t(a)}},r.baseMany=function(i,t,a,o,d){var u,h,p,A;for(p=d,A=a?"":[];!(t!=null&&(u=t(p),u!=null)||(h=i(p),h==null));)a?A+=h.value:A.push(h.value),p=h.rest;if(!(o&&A.length===0))return new r.Result(A,p)},r.many1=function(i){return function(t){return r.baseMany(i,null,!1,!0,t)}},r.concatMany1Till=function(i,t){return function(a){return r.baseMany(i,t,!0,!0,a)}},r.firstChoice=function(){var i;return i=1<=arguments.length?z.call(arguments,0):[],function(t){var a,o,d,u;for(a=-1,o=i.length;++a<o;)if(d=i[a],u=d(t),u!=null)return u}},R=function(i){var t;return t={},t.wildcard=r.tag("wildcard",r.string(i.wildcardChar)),t.optional=r.tag("optional",r.pick(1,r.string(i.optionalSegmentStartChar),r.lazy(function(){return t.pattern}),r.string(i.optionalSegmentEndChar))),t.name=r.regex(new RegExp("^["+i.segmentNameCharset+"]+")),t.named=r.tag("named",r.pick(1,r.string(i.segmentNameStartChar),r.lazy(function(){return t.name}))),t.escapedChar=r.pick(1,r.string(i.escapeChar),r.regex(/^./)),t.static=r.tag("static",r.concatMany1Till(r.firstChoice(r.lazy(function(){return t.escapedChar}),r.regex(/^./)),r.firstChoice(r.string(i.segmentNameStartChar),r.string(i.optionalSegmentStartChar),r.string(i.optionalSegmentEndChar),t.wildcard))),t.token=r.lazy(function(){return r.firstChoice(t.wildcard,t.optional,t.named,t.static)}),t.pattern=r.many1(r.lazy(function(){return t.token})),t},c={escapeChar:"\\",segmentNameStartChar:":",segmentValueCharset:"a-zA-Z0-9-_~ %",segmentNameCharset:"a-zA-Z0-9",optionalSegmentStartChar:"(",optionalSegmentEndChar:")",wildcardChar:"*"},f=function(i,t){if(Array.isArray(i))return E(i,function(a){return f(a,t)});switch(i.tag){case"wildcard":return"(.*?)";case"named":return"(["+t+"]+)";case"static":return y(i.value);case"optional":return"(?:"+f(i.value,t)+")?"}},l=function(i,t){return t==null&&(t=c.segmentValueCharset),"^"+f(i,t)+"$"},s=function(i){if(Array.isArray(i))return $(i,s);switch(i.tag){case"wildcard":return["_"];case"named":return[i.value];case"static":return[];case"optional":return s(i.value)}},g=function(i,t,a,o){var d,u,h,p;if(o==null&&(o=!1),p=i[t],p==null){if(o)throw new Error("no values provided for key `"+t+"`");return}if(d=a[t]||0,u=Array.isArray(p)?p.length-1:0,d>u){if(o)throw new Error("too few values provided for key `"+t+"`");return}return h=Array.isArray(p)?p[d]:p,o&&(a[t]=d+1),h},n=function(i,t,a){var o,d;if(Array.isArray(i)){for(o=-1,d=i.length;++o<d;)if(n(i[o],t,a))return!0;return!1}switch(i.tag){case"wildcard":return g(t,"_",a,!1)!=null;case"named":return g(t,i.value,a,!1)!=null;case"static":return!1;case"optional":return n(i.value,t,a)}},w=function(i,t,a){if(Array.isArray(i))return E(i,function(o){return w(o,t,a)});switch(i.tag){case"wildcard":return g(t,"_",a,!0);case"named":return g(t,i.value,a,!0);case"static":return i.value;case"optional":return n(i.value,t,a)?w(i.value,t,a):""}},e=function(i,t){var a,o,d,u,h;if(i instanceof e){this.isRegex=i.isRegex,this.regex=i.regex,this.ast=i.ast,this.names=i.names;return}if(this.isRegex=i instanceof RegExp,!(typeof i=="string"||this.isRegex))throw new TypeError("argument must be a regex or a string");if(this.isRegex){if(this.regex=i,t!=null){if(!Array.isArray(t))throw new Error("if first argument is a regex the second argument may be an array of group names but you provided something else");if(a=M(this.regex),t.length!==a)throw new Error("regex contains "+a+" groups but array of group names contains "+t.length);this.names=t}return}if(i==="")throw new Error("argument must not be the empty string");if(h=i.replace(/\s+/g,""),h!==i)throw new Error("argument must not contain whitespace");if(o={escapeChar:(t!=null?t.escapeChar:void 0)||c.escapeChar,segmentNameStartChar:(t!=null?t.segmentNameStartChar:void 0)||c.segmentNameStartChar,segmentNameCharset:(t!=null?t.segmentNameCharset:void 0)||c.segmentNameCharset,segmentValueCharset:(t!=null?t.segmentValueCharset:void 0)||c.segmentValueCharset,optionalSegmentStartChar:(t!=null?t.optionalSegmentStartChar:void 0)||c.optionalSegmentStartChar,optionalSegmentEndChar:(t!=null?t.optionalSegmentEndChar:void 0)||c.optionalSegmentEndChar,wildcardChar:(t!=null?t.wildcardChar:void 0)||c.wildcardChar},u=R(o),d=u.pattern(i),d==null)throw new Error("couldn't parse pattern");if(d.rest!=="")throw new Error("could only partially parse pattern");this.ast=d.value,this.regex=new RegExp(l(this.ast,o.segmentValueCharset)),this.names=s(this.ast)},e.prototype.match=function(i){var t,a;return a=this.regex.exec(i),a==null?null:(t=a.slice(1),this.names?F(this.names,t):t)},e.prototype.stringify=function(i){if(i==null&&(i={}),this.isRegex)throw new Error("can't stringify patterns generated from a regex");if(i!==Object(i))throw new Error("argument must be an object or undefined");return w(this.ast,i,{})},e.escapeForRegex=y,e.concatMap=$,e.stringConcatMap=E,e.regexGroupCount=M,e.keysAndValuesToObject=F,e.P=r,e.newParser=R,e.defaultOptions=c,e.astNodeToRegexString=l,e.astNodeToNames=s,e.getParam=g,e.astNodeContainsSegmentsForProvidedParams=n,e.stringify=w,e})});var V=(r=16)=>{let e=[],n=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];for(let s=0;s<r;s++)e.push(n[Math.floor(Math.random()*16)]);return e.join("")};var m=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var P=r=>{try{return typeof r=="undefined"}catch(e){m("types.isUndefined",e)}},U=r=>{try{return r===null}catch(e){m("types.isNull",e)}};var S=r=>{try{return!!Array.isArray(r)}catch(e){m("types.isArray",e)}};var C=r=>{try{return typeof r=="function"}catch(e){m("types.isFunction",e)}};var N=r=>{try{return!!(r&&typeof r=="object"&&!Array.isArray(r))}catch(e){m("types.isObject",e)}};var b=r=>{try{return typeof r=="string"}catch(e){m("types.isString",e)}};var G=(r=[],e="")=>{try{return(S(r)&&r.find(s=>s?.ssrId===e))?.data||{}}catch(n){m("findComponentDataFromSSR",n)}};var B=(()=>{let r=0;return(e,n)=>{clearTimeout(r),r=setTimeout(e,n)}})();var x=r=>!!(r&&typeof r=="object"&&!Array.isArray(r));var D=r=>typeof r=="string";var I=/^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/,j=(r,e="")=>{if(!e)return!0;if(e&&!D(e))return!1;let n=e?e.replace(/[- ]+/g,""):"";return r===!0?n.match(new RegExp(I)):!n.match(new RegExp(I))};var O=/^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/,K=(r,e="")=>r===!0?!!e.match(O):!e.match(O);var _=(r,e="")=>r===e;var H=(r,e="")=>r===e;var q=(r,e="")=>e.length<=r;var Y=(r,e="")=>e.length>=r;var Q=/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,W=(r,e="")=>r===!0?!!e.match(Q):!e.match(Q);var J={AF:/^\d{4}$/,AX:/^\d{5}$/,AL:/^\d{4}$/,DZ:/^\d{5}$/,AS:/^\d{5}(-{1}\d{4,6})$/,AD:/^[Aa][Dd]\d{3}$/,AI:/^[Aa][I][-][2][6][4][0]$/,AR:/^\d{4}|[A-Za-z]\d{4}[a-zA-Z]{3}$/,AM:/^\d{4}$/,AC:/^[Aa][Ss][Cc][Nn]\s{0,1}[1][Zz][Zz]$/,AU:/^\d{4}$/,AT:/^\d{4}$/,AZ:/^[Aa][Zz]\d{4}$/,BH:/^\d{3,4}$/,BD:/^\d{4}$/,BB:/^[Aa][Zz]\d{5}$/,BY:/^\d{6}$/,BE:/^\d{4}$/,BM:/^[A-Za-z]{2}\s([A-Za-z]{2}|\d{2})$/,BT:/^\d{5}$/,BO:/^\d{4}$/,BA:/^\d{5}$/,BR:/^\d{5}-\d{3}$/,"":/^[Bb][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,IO:/^[Bb]{2}[Nn][Dd]\s{0,1}[1][Zz]{2}$/,VG:/^[Vv][Gg]\d{4}$/,BN:/^[A-Za-z]{2}\d{4}$/,BG:/^\d{4}$/,KH:/^\d{5}$/,CA:/^(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\s{0,1}\d(?=[^DdFfIiOoQqUu\d\s])[A-Za-z]\d$/,CV:/^\d{4}$/,KY:/^[Kk][Yy]\d[-\s]{0,1}\d{4}$/,TD:/^\d{5}$/,CL:/^\d{7}\s\(\d{3}-\d{4}\)$/,CN:/^\d{6}$/,CX:/^\d{4}$/,CC:/^\d{4}$/,CO:/^\d{6}$/,CD:/^[Cc][Dd]$/,CR:/^\d{4,5}$/,HR:/^\d{5}$/,CU:/^\d{5}$/,CY:/^\d{4}$/,CZ:/^\d{5}\s\(\d{3}\s\d{2}\)$/,DK:/^\d{4}$/,DO:/^\d{5}$/,EC:/^\d{6}$/,SV:/^1101$/,EG:/^\d{5}$/,EE:/^\d{5}$/,ET:/^\d{4}$/,FK:/^[Ff][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,FO:/^\d{3}$/,FI:/^\d{5}$/,FR:/^\d{5}$/,GF:/^973\d{2}$/,PF:/^987\d{2}$/,GA:/^\d{2}\s[a-zA-Z-_ ]\s\d{2}$/,GE:/^\d{4}$/,DE:/^\d{2}$/,GI:/^[Gg][Xx][1]{2}\s{0,1}[1][Aa]{2}$/,GR:/^\d{3}\s{0,1}\d{2}$/,GL:/^\d{4}$/,GP:/^971\d{2}$/,GU:/^\d{5}$/,GT:/^\d{5}$/,GG:/^[A-Za-z]{2}\d\s{0,1}\d[A-Za-z]{2}$/,GW:/^\d{4}$/,HT:/^\d{4}$/,HM:/^\d{4}$/,HN:/^\d{5}$/,HU:/^\d{4}$/,IS:/^\d{3}$/,IN:/^\d{6}$/,ID:/^\d{5}$/,IR:/^\d{5}-\d{5}$/,IQ:/^\d{5}$/,IM:/^[Ii[Mm]\d{1,2}\s\d\[A-Z]{2}$/,IL:/^\b\d{5}(\d{2})?$/,IT:/^\d{5}$/,JM:/^\d{2}$/,JP:/^\d{7}\s\(\d{3}-\d{4}\)$/,JE:/^[Jj][Ee]\d\s{0,1}\d[A-Za-z]{2}$/,JO:/^\d{5}$/,KZ:/^\d{6}$/,KE:/^\d{5}$/,KR:/^\d{6}\s\(\d{3}-\d{3}\)$/,XK:/^\d{5}$/,KW:/^\d{5}$/,KG:/^\d{6}$/,LV:/^[Ll][Vv][- ]{0,1}\d{4}$/,LA:/^\d{5}$/,LB:/^\d{4}\s{0,1}\d{4}$/,LS:/^\d{3}$/,LR:/^\d{4}$/,LY:/^\d{5}$/,LI:/^\d{4}$/,LT:/^[Ll][Tt][- ]{0,1}\d{5}$/,LU:/^\d{4}$/,MK:/^\d{4}$/,MG:/^\d{3}$/,MV:/^\d{4,5}$/,MY:/^\d{5}$/,MT:/^[A-Za-z]{3}\s{0,1}\d{4}$/,MH:/^\d{5}$/,MQ:/^972\d{2}$/,YT:/^976\d{2}$/,FM:/^\d{5}(-{1}\d{4})$/,MX:/^\d{5}$/,MD:/^[Mm][Dd][- ]{0,1}\d{4}$/,MC:/^980\d{2}$/,MN:/^\d{5}$/,ME:/^\d{5}$/,MS:/^[Mm][Ss][Rr]\s{0,1}\d{4}$/,MA:/^\d{5}$/,MZ:/^\d{4}$/,MM:/^\d{5}$/,NA:/^\d{5}$/,NP:/^\d{5}$/,NL:/^\d{4}\s{0,1}[A-Za-z]{2}$/,NC:/^988\d{2}$/,NZ:/^\d{4}$/,NI:/^\d{5}$/,NE:/^\d{4}$/,NG:/^\d{6}$/,NF:/^\d{4}$/,MP:/^\d{5}$/,NO:/^\d{4}$/,OM:/^\d{3}$/,PK:/^\d{5}$/,PW:/^\d{5}$/,PA:/^\d{6}$/,PG:/^\d{3}$/,PY:/^\d{4}$/,PE:/^\d{5}$/,PH:/^\d{4}$/,PN:/^[Pp][Cc][Rr][Nn]\s{0,1}[1][Zz]{2}$/,PL:/^\d{2}[- ]{0,1}\d{3}$/,PT:/^\d{4}$/,PR:/^\d{5}$/,RE:/^974\d{2}$/,RO:/^\d{6}$/,RU:/^\d{6}$/,BL:/^97133$/,SH:/^[Ss][Tt][Hh][Ll]\s{0,1}[1][Zz]{2}$/,MF:/^97150$/,PM:/^97500$/,VC:/^[Vv][Cc]\d{4}$/,SM:/^4789\d$/,SA:/^\d{5}(-{1}\d{4})?$/,SN:/^\d{5}$/,RS:/^\d{5}$/,SG:/^\d{2}$/,SK:/^\d{5}\s\(\d{3}\s\d{2}\)$/,SI:/^([Ss][Ii][- ]{0,1}){0,1}\d{4}$/,ZA:/^\d{4}$/,GS:/^[Ss][Ii][Qq]{2}\s{0,1}[1][Zz]{2}$/,ES:/^\d{5}$/,LK:/^\d{5}$/,SD:/^\d{5}$/,SZ:/^[A-Za-z]\d{3}$/,SE:/^\d{3}\s*\d{2}$/,CH:/^\d{4}$/,SJ:/^\d{4}$/,TW:/^\d{5}$/,TJ:/^\d{6}$/,TH:/^\d{5}$/,TT:/^\d{6}$/,TN:/^\d{4}$/,TR:/^\d{5}$/,TM:/^\d{6}$/,TC:/^[Tt][Kk][Cc][Aa]\s{0,1}[1][Zz]{2}$/,UA:/^\d{5}$/,GB:/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z-[CIKMOV]]{2}/,US:/^\b\d{5}\b(?:[- ]{1}\d{4})?$/,UY:/^\d{5}$/,VI:/^\d{5}$/,UZ:/^\d{3} \d{3}$/,VA:/^120$/,VE:/^\d{4}(\s[a-zA-Z]{1})?$/,VN:/^\d{6}$/,WF:/^986\d{2}$/,ZM:/^\d{5}$/},X=(r,e="")=>{let n=x(r)&&r.iso?J[r.iso||"US"]:J.US;return x(r)?r.rule===!0?!!e.match(n):!e.match(n):r===!0?!!e.match(n):!e.match(n)};var ee=(r,e="",n={isChecked:!1})=>{if(!n.isChecked)return r===!0?e&&e.trim()!=="":e&&e.trim()==="";if(n.isChecked)return r===!0?e:!e};var re=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,te=(r,e="")=>r===!0?!!e.match(re):!e.match(re);var ie=/^[a-z0-9]+(?:-[a-z0-9]+)*$/,ne=(r,e="")=>r===!0?!!e.match(ie):!e.match(ie);var ae=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,se=(r,e="")=>r===!0?!!e.match(ae):!e.match(ae);var oe=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/,de=(r,e="")=>r===!0?!!e.match(oe):!e.match(oe);var le={AT:/^(AT)(U\d{8}$)/i,BE:/^(BE)(\d{10}$)/i,BG:/^(BG)(\d{9,10}$)/i,CY:/^(CY)([0-5|9]\d{7}[A-Z]$)/i,CZ:/^(CZ)(\d{8,10})?$/i,DE:/^(DE)([1-9]\d{8}$)/i,DK:/^(DK)(\d{8}$)/i,EE:/^(EE)(10\d{7}$)/i,EL:/^(EL)(\d{9}$)/i,ES:/^(ES)([0-9A-Z][0-9]{7}[0-9A-Z]$)/i,EU:/^(EU)(\d{9}$)/i,FI:/^(FI)(\d{8}$)/i,FR:/^(FR)([0-9A-Z]{2}[0-9]{9}$)/i,GB:/^(GB)((?:[0-9]{12}|[0-9]{9}|(?:GD|HA)[0-9]{3})$)/i,GR:/^(GR)(\d{8,9}$)/i,HR:/^(HR)(\d{11}$)/i,HU:/^(HU)(\d{8}$)/i,IE:/^(IE)([0-9A-Z\*\+]{7}[A-Z]{1,2}$)/i,IT:/^(IT)(\d{11}$)/i,LV:/^(LV)(\d{11}$)/i,LT:/^(LT)(\d{9}$|\d{12}$)/i,LU:/^(LU)(\d{8}$)/i,MT:/^(MT)([1-9]\d{7}$)/i,NL:/^(NL)(\d{9}B\d{2}$)/i,NO:/^(NO)(\d{9}$)/i,PL:/^(PL)(\d{10}$)/i,PT:/^(PT)(\d{9}$)/i,RO:/^(RO)([1-9]\d{1,9}$)/i,RU:/^(RU)(\d{10}$|\d{12}$)/i,RS:/^(RS)(\d{9}$)/i,SI:/^(SI)([1-9]\d{7}$)/i,SK:/^(SK)([1-9]\d[(2-4)|(6-9)]\d{7}$)/i,SE:/^(SE)(\d{10}01$)/i},ue=(r,e="")=>{let n=x(r)&&r.iso?le[r.iso||"EU"]:le.EU;return x(r)?r.rule===!0?!!e.match(n):!e.match(n):r===!0?!!e.match(n):!e.match(n)};var ce={creditCard:j,email:K,equals:_,matches:H,maxLength:q,minLength:Y,phone:W,postalCode:X,required:ee,semVer:te,slug:ne,strongPassword:se,url:de,vat:ue};var me=class{constructor(e,n={}){this.fieldsToListenToForChanges=["checkbox","color","date","datetime-local","email","file","hidden","month","number","password","radio","range","search","tel","text","time","url","week"],this.defaultValidationErrors={required:()=>"This field is required.",email:()=>"Must be a valid email.",creditCard:()=>"Must be a valid credit card number.",equals:s=>`Value must equal ${s}.`,matches:s=>`Field must match ${s}.`,maxLength:s=>`Field value can be no greater than ${s}.`,minLength:s=>`Field value can be no less than ${s}.`,phone:()=>"Field value must be a valid telephone number.",postalCode:()=>"Field value must be a valid postal code.",semVer:()=>"Field value must be a valid semantic version.",slug:()=>"Field value must be a valid URL slug.",strongPassword:()=>"Field value must be a valid password.",url:()=>"Field value must be a valid URL.",vat:()=>"Field value must be a valid VAT code."},e||console.warn("[validateForm] Must pass an HTML <form></form> element to validate."),this.form=e,this.setOptions(n),this.attachEventListeners()}setOptions(e={}){this.rules=e.rules||{},this.messages=e.messages||{},this.onSubmit=e.onSubmit,this.fields=this.serialize()}updateOptions(e={}){this.setOptions(e)}serialize(){if(this.form)return Object.keys(this.rules).map(n=>{let s=this.form.querySelector(`[name="${n}"]`),l=s?.type;return{listenForChanges:this.fieldsToListenToForChanges.includes(l),type:l,name:n,element:s,validations:Object.entries(this.rules[n]).map(([$,c])=>({name:$,rule:c,valid:!1})).sort(($,c)=>$.name>c.name?1:-1),errorMessages:this.messages[n]?Object.keys(this.messages[n]):{}}})}attachEventListeners(){if(this.form){let e=n=>{n.stopPropagation(),n.preventDefault(),this.validate()&&this.onSubmit&&this.onSubmit()};this.form.removeEventListener("submit",e),this.form.addEventListener("submit",e)}this.fields.forEach(e=>{if(e?.element&&e?.listenForChanges){let n=()=>{B(()=>{this.validate(e.name)},100)};e.element.removeEventListener("input",n),e.element.addEventListener("input",n),e.element.removeEventListener("change",n),e.element.addEventListener("change",n)}})}validate(e=null){if(e){let n=this.fields.find(s=>s.name===e);return this.validateField(n),this.checkIfValid()}else return this.clearExistingErrors(),this.fields.forEach(n=>{this.validateField(n)}),this.checkIfValid()}checkIfValid(){return!this.fields.map(n=>n.validations.some(s=>!s.valid)).includes(!0)}validateField(e){let n=this.form.querySelector(`[name="${e.name}"]`),s=["checkbox","radio"].includes(e.type),l=s?null:e?.element?.value?.trim(),f=s?e?.element?.checked:null;e.validations.forEach(c=>{if(this.isValidValue(s,s?f:l,c))this.markValidationAsValid(e,c.name);else{let y=this.messages[e.name]&&this.messages[e.name][c.name];this.markValidationAsInvalid(e,c.name),this.renderError(e.element,y||this.defaultValidationErrors[c.name](c.rule,l))}});let $=e.validations.some(c=>!c.valid);return $&&(n.classList.add("error"),n.focus()),$||(n.classList.remove("error"),this.clearExistingError(e.name)),!$}markValidationAsInvalid(e,n){let l=[...e.validations].find(f=>f.name===n);l.valid=!1}markValidationAsValid(e,n){let l=[...e.validations].find(f=>f.name===n);l.valid=!0}isValidValue(e,n,s){let l=ce[s.name];if(l)return l(s.rule,n,{isChecked:e})}clearExistingErrors(){this.form&&this.form.querySelectorAll(".input-hint.error").forEach(e=>e.remove())}clearExistingError(e=""){let n=document.getElementById(`error-${e}`);n&&n.remove()}renderError(e,n=""){if(e){this.clearExistingError(e.name);let s=document.createElement("p");s.classList.add("input-hint"),s.classList.add("error"),s.setAttribute("id",`error-${e.name}`),s.innerText=n,e.after(s)}}},Le=(r,e)=>new Promise((n,s)=>{try{new me(r,e).validate()?n():s()}catch(l){console.warn(l)}}),he=Le;var fe=(r={},e={})=>{try{return[...Object.keys(e),...Object.keys(r)].filter((s,l,f)=>f.indexOf(s)===l).reduce((s,l)=>{let f=e[l],$=r[l]||null,c=!P(f)&&!U(f);return s[l]=c?f:$,s},{})}catch(n){m("component.props.compile",n)}};var pe=(r={},e={})=>{try{return r&&b(r)?r:r&&C(r)?r(e):""}catch(n){m("component.css.compile",n)}};var ze=(r={},e=null)=>{try{let n=e(r);return n&&N(n)&&!S(n)?Object.assign({},n):{}}catch(n){m("component.state.compile.compileState",n)}},$e=(r={},e={})=>{try{return C(e)?ze(r,e):Object.assign({},e)}catch(n){m("component.state.compile",n)}};var L={onBeforeMount:()=>null,onMount:()=>null,onBeforeUnmount:()=>null,onUpdateProps:()=>null};var ge=(r={},e={})=>{try{return e?Object.entries({...L,...e||{}}).reduce((n={},[s,l])=>(n[s]=()=>l(r),n),{}):L}catch(n){m("component.lifecycle.compile",n)}};var xe=(r={},e={})=>{try{return Object.entries(e).reduce((n={},[s,l])=>(n[s]=(...f)=>l(...f,r),n),{})}catch{m("component.methods.compile")}};var Ae=Ze(we());var T=(r={})=>{try{return{...r,isActive:(e="")=>{if(!b(e))return!1;if(r?.route!=="*"){let n=new Ae.default(r?.route||"");return r?.path&&r.path===e||!!n?.match(e)}return!1}}}catch(e){m("component.url.compile",e)}};var k=()=>typeof window=="undefined";var et=(r={},e={})=>{try{e?.props?.hasOwnProperty("isScaleUp")&&console.log("REGISTER",e.props),r.options=e||{},r.id=e?._componentId||null,r.instanceId=V(8),r.ssrId=e?._ssrId||null,r.css=pe(),r.data=G(e?.dataFromSSR,e?._ssrId),r.defaultProps=e?.defaultProps||{},r.props=fe(e?.defaultProps,e?.existingProps||e?.props),r.state=$e(r,e?.existingState||e?.state),r.events=e?.events||{},r.lifecycle=ge(r,e?.lifecycle),r.methods=xe(r,e?.methods),r.wrapper=e?.wrapper||{},r.translations=e?.translations||{},r.validateForm=he,r.DOMNode=null,r.dom={},r.dom.virtual={},r.dom.actual={},k()&&(r.url=T(e?.url)),!k()&&window.__joystick_url__&&(r.url=T(window.__joystick_url__))}catch(n){m("component.registerOptions",n)}};export{et as default};
