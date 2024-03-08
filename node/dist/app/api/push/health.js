import n from"fs";const{readFile:a}=n.promises,o=async(s={},t={})=>{const e=await a("/root/push/instance_token.txt","utf-8");return s?.headers["x-instance-token"]===e?.replace(`
`,"")?t.status(200).send("ok"):t.status(403).send("Sorry, you must pass a valid instance token to access this endpoint.")};var i=o;export{i as default};
