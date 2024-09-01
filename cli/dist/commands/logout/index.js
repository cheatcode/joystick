import s from"fs";import t from"os";import e from"../../lib/color_log.js";import n from"../../lib/path_exists.js";const{unlink:i}=s.promises,r=async(m={},p={})=>{const o=`${t.homedir()}/.push/session_token`;return await n(o)&&(await i(o,"utf-8"),e(`
\u2714 Logged out
`,"greenBright")),!0};var c=r;export{c as default};
//# sourceMappingURL=index.js.map
