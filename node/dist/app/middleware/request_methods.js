const o=(e,d,t)=>{["OPTIONS","HEAD","CONNECT","GET","POST","PUT","DELETE","PATCH"].includes(e.method)||d.status(405).send(`${e.method} not allowed.`),t()};var l=o;export{l as default};
