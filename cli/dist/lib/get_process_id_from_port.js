import n from"child_process";import p from"util";const t=p.promisify(n.exec),i=async(e=0)=>process.platform==="win32"?t(`netstat -a -n -o | find "${e}"`).then(o=>{const s=o.stdout?.split(`
`);return s&&s[0]&&s[0]?.split(" ")?.filter(r=>r!=="")?.map(r=>r?.replace("\r",""))?.pop()||null}).catch(()=>null):(await t(`lsof -n -i:${e} | grep LISTEN | awk '{ print $2 }' | uniq`))?.stdout||null;var a=i;export{a as default};
//# sourceMappingURL=get_process_id_from_port.js.map
