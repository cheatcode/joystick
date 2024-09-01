import e from"./check_connection.js";import a from"./index.js";const t=async(n={},c=2610)=>{const o=n.connection&&Object.keys(n.connection).length>0;return o&&await e(n.connection,n.options),{pid:o?null:await a(c),connection:o?n.connection:{hosts:[{hostname:"127.0.0.1",port:c}],database:"app",username:"",password:""}}};var m=t;export{m as default};
//# sourceMappingURL=connect.js.map
