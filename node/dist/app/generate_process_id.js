import _ from"fs";import i from"../lib/generate_id.js";import o from"../lib/path_exists.js";const{mkdir:a,writeFile:p,readFile:n}=_.promises,d=async()=>{const s="./.joystick",t="./.joystick/PROCESS_ID",r=await o(s),c=await o(t);if(r||await a(s),!c){const e=i(32);return await p(t,`${i(32)}`),e}return(await n(t,"utf-8"))?.trim()};var m=d;export{m as default};
