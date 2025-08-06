import e from"./check_connection.js";import t from"./index.js";const a=async(n={},c=2610)=>{const o=n.connection&&Object.keys(n.connection).length>0;return o&&await e(n.connection,n.options),{pid:o?null:await t(c),connection:o?n.connection:{hosts:[{hostname:"127.0.0.1",port:c}],database:0,username:"",password:""}}};var m=a;export{m as default};
//# sourceMappingURL=connect.js.map
