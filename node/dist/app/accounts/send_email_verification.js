import t from"../databases/queries/accounts.js";import r from"../settings/load.js";import n from"../email/send.js";const a=(e="",i="")=>{const o=r();return console.log("SEND TIME",{to:e,from:o?.config?.email?.from,subject:o?.config?.email?.verify?.subject||"Verify your email address",template:o?.config?.email?.verify?.template||"verify_email",props:{emailAddress:e,email_address:e,url:process.env.NODE_ENV==="development"?`http://localhost:${process.env.PORT}/api/_accounts/verify-email?token=${i}`:`${process.env.ROOT_URL}/api/_accounts/verify-email?token=${i}`}}),n({to:e,from:o?.config?.email?.from,subject:o?.config?.email?.verify?.subject||"Verify your email address",template:o?.config?.email?.verify?.template||"verify_email",props:{emailAddress:e,email_address:e,url:process.env.NODE_ENV==="development"?`http://localhost:${process.env.PORT}/api/_accounts/verify-email?token=${i}`:`${process.env.ROOT_URL}/api/_accounts/verify-email?token=${i}`}})},s=(e="")=>t("create_email_verification_token",{user_id:e}),c=(e="")=>t("user",{_id:e}),l=async(e="")=>{console.log("SEND VERIFICATION",e);const i=await c(e);if(console.log("USER SEND VERIFICATION",{user_id:e,user:i}),!i?.emailVerified&&!i?.emailVerifiedAt){const o=await s(i?._id||i?.user_id);await a(i?.emailAddress,o)}return!0};var u=l;export{u as default};
