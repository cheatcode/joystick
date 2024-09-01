import r from"fs";import{codeFrameColumns as s}from"@babel/code-frame";const{readFile:a}=r.promises,m=async(t="",e={})=>{const o=await a(t,"utf-8");return s(o,{start:e})};var i=m;export{i as default};
//# sourceMappingURL=get_code_frame.js.map
