const p=(c={})=>Object.entries(c).reduce((u,[l,e])=>(e&&e.value&&e.parent&&e.parent==="create"&&(u[l]=e.value),e&&e.value&&(!e.parent||e.parent!=="create")&&(u[l]=e.value.includes("-")?null:e.value),u),{});var r=p;export{r as default};
//# sourceMappingURL=parse_args.js.map
