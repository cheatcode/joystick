import{PurgeCSS as s}from"purgecss";const n=async(t="",e="")=>{const r=await new s().purge({content:[{raw:t,extension:"html"}],css:[{raw:e}]});return r[0]&&r[0].css||""};var o=n;export{o as default};
