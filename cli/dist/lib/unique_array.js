const r=(n=[])=>{const u=new Set,i=new WeakMap,t=[];for(let s=0;s<n.length;s++){const e=n[s];typeof e=="object"&&e!==null?i.has(e)||(i.set(e,!0),t.push(e)):u.has(e)||(u.add(e),t.push(e))}return t};var a=r;export{a as default};
//# sourceMappingURL=unique_array.js.map
