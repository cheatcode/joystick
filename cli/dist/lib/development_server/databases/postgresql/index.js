import g from"child_process";import w from"fs";import h from"util";import m from"../../../cli_log.js";import y from"../../../command_exists.js";import x from"../../../get_platform_safe_path.js";import f from"../../../get_process_id_from_port.js";import"../../../kill_port_process.js";import u from"../../../path_exists.js";const c=h.promisify(g.exec),{rename:q}=w.promises,k=async(t=2610)=>{const n=await u(".joystick/data/postgresql");let s=await u(`.joystick/data/postgresql_${t}`);return n&&!s&&(await q(".joystick/data/postgresql",`.joystick/data/postgresql_${t}`),s=!0),s},j=()=>{m("PostgreSQL is not installed on this computer. You can download PostgreSQL at https://www.postgresql.org/download. After you've installed PostgreSQL, run joystick start again, or, remove PostgreSQL from your databases list in your settings.development.json file to skip startup.",{level:"danger",docs:"https://cheatcode.co/docs/joystick/cli#databases"})},b=()=>y("psql"),P=()=>y("pg_ctl"),L=async(t=2610)=>{await b()||(j(),process.exit(1));const s=await P();s||m("PostgreSQL is installed on this computer, but pg_ctl (what Joystick uses to start and manage PostgreSQL) is not in your command line's PATH variable. Add pg_ctl to your command line's PATH, restart your command line, and try again.",{level:"danger",docs:"https://cheatcode.co/docs/joystick/postgresql#path"});try{!await k(t)&&s&&await c(`pg_ctl init -D .joystick/data/postgresql_${t}`);const o=t,l=parseInt(await f(o),10);l&&await c(`pg_ctl kill KILL ${l}`);const d=g.spawn("pg_ctl",["-o",`"-p ${o}"`,"-D",x(`.joystick/data/postgresql_${t}`),"start"].filter(e=>!!e));return new Promise(e=>{d.stderr.on("data",async r=>{const i=r?.toString();i?.includes("another server might be running")||console.warn(i)}),d.stdout.on("data",async r=>{if((r?.toString()).includes("database system is ready to accept connections")){const _=(await f(o))?.replace(`
`,"");c(`createdb -h 127.0.0.1 -p ${o} app`).then(a=>{e(parseInt(_,10))}).catch(({stderr:a})=>{a&&a.includes('database "app" already exists')?e(parseInt(_,10)):console.log(a)})}})})}catch(p){console.warn(p),process.exit(1)}};var K=L;export{K as default};
