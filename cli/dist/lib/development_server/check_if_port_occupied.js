import c from"net";const t=(e={})=>{e.end(),e.destroy(),e.unref()},r=(e=2600)=>new Promise(o=>{const n=new c.Socket;n.once("connect",()=>{t(n),o(!0)}),n.once("error",()=>{t(n),o(!1)}),n.connect({port:e,host:"127.0.0.1"},function(){})});var f=r;export{f as default};
//# sourceMappingURL=check_if_port_occupied.js.map
