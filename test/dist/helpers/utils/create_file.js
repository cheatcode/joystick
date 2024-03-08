import{File as n}from"node-fetch";const f=(t=128,e="test.txt",r="text/plain")=>new n(t instanceof Buffer?t:[new Uint8Array(t)],e,{type:r});var a=f;export{a as default};
