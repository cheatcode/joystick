import r from"../../lib/development_server/index.js";const t=async(o={},e={})=>{console.log({start_options_imports:e?.imports}),await r({environment:e?.environment||"development",port:e?.port||2600,debug:!!e?.debug,imports:e?.imports||[]})};var n=t;export{n as default};
//# sourceMappingURL=index.js.map
