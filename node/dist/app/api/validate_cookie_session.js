const t=async(s=null,n=null)=>{const e=s?.context?.session;return process.env.NODE_ENV==="test"?!0:!(!e||!e.csrf)};var r=t;export{r as default};
