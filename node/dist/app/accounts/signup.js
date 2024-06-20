import i from"../databases/queries/accounts.js";import m from"../../lib/camel_pascal_to_snake.js";import u from"../databases/postgresql/accounts/create_accounts_metadata_table_columns.js";import l from"../databases/database_type_map.js";import f from"./generate_account_session.js";import w from"../api/get_output.js";import y from"../databases/get_target_database_connection.js";import g from"../../lib/hash_string.js";import p from"./roles/index.js";import n from"../../lib/types.js";const b=(e=null,a=null)=>i("add_session",{user_id:e,session:a}),h=(e="")=>i("user",{_id:e}),x=async(e={})=>i("create_user",e),_=(e={})=>Object.entries(e||{}).reduce((a={},[t,s])=>(a[m(t)]=s,a),{}),E=async(e={})=>{const a=y("users"),t=l[a?.provider];let s={password:g(e.password)};if((e?.email_address||e?.emailAddress)&&(s.emailAddress=e?.email_address||e.emailAddress),e?.username&&(s.username=e?.username),e?.metadata&&n.is_object(e.metadata)&&t==="sql"){const r=_(e.metadata);await u(a,r);const d={...e?.metadata||{}};d?.roles&&delete d.roles,s={..._(d),...s}}if(e?.metadata&&n.is_object(e.metadata)&&t==="nosql"){let r={...e?.metadata||{}};r?.roles&&delete r.roles,s={...r||{},...s}}return s},j=(e="",a="")=>i("existing_user",{email_address:e,username:a}),v=async(e={})=>{if(!e.email_address&&!e.emailAddress)throw new Error("Email address is required.");if(!e.password)throw new Error("Password is required.");const a=await j(e.email_address||e.emailAddress,e?.username);if(a&&process.env.NODE_ENV!=="test")throw new Error(`A user with the ${a.existing_username?"username":"email address"} ${a.existing_username||a.existing_email_address} already exists.`);let t,s=a?._id||a?.user_id;a||(t=await E(e),s=await x(t));const r=await h(s),d=f();if(s&&await b(s,d),e?.metadata?.roles?.length>0&&process.env.NODE_ENV==="test")for(let o=0;o<e?.metadata?.roles?.length;o+=1){const c=e?.metadata?.roles[o];p.grant(r?.user_id,c)}return(n.is_function(process.joystick?.app_options?.accounts?.events?.onSignup)||n.is_function(process.joystick?.app_options?.accounts?.events?.on_signup))&&(process.joystick?.app_options?.accounts?.events?.onSignup||process.joystick?.app_options?.accounts?.events?.on_signup)({...d,user_id:s,userId:s,user:{...r}}),{...d,userId:s,user_id:s,user:w(r,e?.output)}};var z=v;export{z as default};
