const n=(e="",t={})=>{if(!e||!t)return null;t.cookie(e,null,{secure:process.env.NODE_ENV!=="development",httpOnly:!0,expires:new Date})};var l=n;export{l as default};
