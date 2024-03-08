import y from"chalk";import w from"child_process";import s from"fs";import{dirname as $}from"path";import x from"util";import z from"./build_files.js";import v from"./get_files_to_build.js";import k from"./get_file_operation.js";import F from"./get_path_platform.js";import j from"./get_tar_ignore_list.js";import B from"../load_settings.js";import P from"../loader.js";import f from"../path_exists.js";import S from"../../lib/encrypt_buffer.js";const{mkdir:A,copyFile:D,readFile:L,writeFile:q,readdir:C}=s.promises,c=x.promisify(w.exec),E=(r=[])=>r?.map(a=>({path:a,operation:k(a),platform:F(a)})),G=async(r={})=>{const a=new P,e=r?.type||"tar",l=r?.environment||"production";a.print(`Building app to ${e} for ${l}...`);const n=await B(l),u=n?.config?.build?.excluded_paths||n?.config?.build?.excludedPaths,m=await v(u),o=e==="tar"?".build/.tar":".build",_=E(m);await f(".build")&&await c("rm -rf .build");const p=[];for(let t=0;t<n?.config?.build?.copy_paths?.length;t+=1){const i=n?.config?.build?.copy_paths[t];if(s.existsSync(i))if(s.lstatSync(i).isDirectory()){const h=await C(i,{recursive:!0});p.push(...(h||[])?.map(g=>`${i}/${g}`))}else p.push(i)}const d=[..._?.filter(t=>t?.operation==="copy_file"),...(p||[])?.map(t=>({path:t}))],b=_?.filter(t=>t?.operation==="build_file");for(let t=0;t<d?.length;t+=1){const i=d[t];await A($(`${o}/${i?.path}`),{recursive:!0}),await D(i?.path,`${o}/${i?.path}`)}if(await z({files:b,environment:l,output_path:o}).catch(t=>{console.warn(t)}),e==="tar"){const t=j(n?.config?.build?.excludedPaths);await c(`cd ${o} && tar --exclude=${t} -czf ../build.tar.gz .`),await c(`rm -rf ${o}`)}if(e==="tar"&&r?.encrypt_build){const t=o?.replace("/.tar","/build.tar.gz"),i=S(await L(t),r?.encryption_key);await q(".build/build.encrypted.tar.gz",i)}r?.silence_confirmation||console.log(y.greenBright(`
\u2714 App built as ${e} to ${e==="tar"?o?.replace("/.tar","/build.tar.gz"):o}!
`)),await f(".build/component_id_cache.json")&&await c("rm -rf .build/component_id_cache.json")};var Z=G;export{Z as default};
