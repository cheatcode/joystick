!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(e="undefined"!=typeof globalThis?globalThis:e||self)["joystick-node"]=n()}(this,(function(){"use strict";const e=e=>!(!e||"object"!=typeof e||Array.isArray(e)),n=(t={},i=[])=>(Object.entries(t).forEach((([l,r])=>{const o=i.find((e=>e.key===l));return o||delete t[l],o&&e(r)&&0===o.children.length?r:o&&e(r)&&o.children.length>0?n(r,o.children):void(o&&Array.isArray(r)&&o.children&&o.children.length>0&&r.forEach((t=>{if(t&&e(t))return n(t,o.children)})))})),t),t=(e=[])=>{const[n,...t]=e;return{head:n,tail:t}},i=(e=[],n=[])=>(n.forEach((n=>{const l=e.find((e=>e.key===n.head));if(!l){const l=n.tail&&n.tail.length>0?t(n.tail):null;e.push({key:n.head,children:l?i([],[l]):[]})}if(l){const e=n.tail&&n.tail.length>0?t(n.tail):null;l.children=[...e?i(l.children,[e]):[]]}})),e);return(e={},l=[])=>{const r=[],o=((e=[])=>e.map((e=>t(e))))(((e=[])=>e.map((e=>e.split("."))))(l));return i(r,o),n(e,r)}}));
