const c=(e={},o="",l="",t=null)=>{if(!e||!o)return null;const n={secure:process.env.NODE_ENV!=="development",httpOnly:!0};t&&(n.expires=new Date(t)),e.cookie(o,l,n)};var s=c;export{s as default};
