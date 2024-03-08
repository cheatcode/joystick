import i from"fs";import t from"./app/accounts/index.js";import n from"./action/index.js";import a from"./lib/escape_html.js";import p from"./app/fixture/index.js";import m from"./app/databases/sql.js";import c from"./app/api/validate_input.js";import _ from"./app/websockets/index.js";import l from"./app/index.js";import f from"./lib/generate_id.js";import u from"./lib/get_origin.js";import d from"./app/settings/load.js";import o from"./lib/node_path_polyfills.js";import e from"./lib/path_exists.js";import x from"./app/email/send.js";const{readFile:r}=i.promises,w={...t,deleteUser:t.delete_user,recoverPassword:t.recover_password,resetPassword:t.reset_password,sendEmailVerification:t.send_email_verification,setPassword:t.set_password,verifyEmail:t.verify_email},h=n,N=o.__dirname,v={send:x},g=a,O=o.__filename,k=p,y=u(),b={continent:await e("/root/push/continent.txt")?(await r("/root/push/continent.txt","utf-8"))?.replace(`
`,""):null,instance_token:await e("/root/push/instance_token.txt")?(await r("/root/push/instance_token.txt","utf-8"))?.replace(`
`,""):null,current_version:await e("/root/push/versions/current")?(await r("/root/push/versions/current","utf-8"))?.replace(`
`,""):null},P=d(),j=m,q=c,E=_,s={app:l,accounts:w,action:h,email:v,emitters:{},escape_html:g,fixture:k,id:f,origin:y,push:b,settings:P,sql:j,validate_input:q,websockets:E,...o};global.joystick=s;var Q=s;export{N as __dirname,O as __filename,w as accounts,h as action,Q as default,v as email,g as escape_html,k as fixture,y as origin,b as push,P as settings,j as sql,q as validate_input,E as websockets};
