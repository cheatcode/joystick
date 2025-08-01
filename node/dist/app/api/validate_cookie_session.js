const o=async(s=null,n=null)=>{const e=s?.context?.session;return console.log("validate_session_cookie",e),process.env.NODE_ENV==="test"?!0:!(!e||!e.csrf)};var t=o;export{t as default};
