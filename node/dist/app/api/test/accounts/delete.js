import s from"../../../databases/queries/accounts.js";const a=async(e={},t={})=>{await s("delete_user",{user_id:e?.body?.user_id}),t.status(200).send({data:{}})};var u=a;export{u as default};
