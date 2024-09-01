import t from"child_process";import e from"util";const s=e.promisify(t.exec),o=async(r=0)=>{const i=parseInt(r,10);if(i){if(process.platform==="win32"){await s(`taskkill /F /PID ${i}`);return}await s(`kill -9 ${i}`)}};var l=o;export{l as default};
//# sourceMappingURL=kill_process_id.js.map
