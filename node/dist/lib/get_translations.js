import g from"fs";import p from"./dynamic_import.js";import _ from"./get_platform_safe_path.js";import h from"../app/settings/load.js";import m from"./path_exists.js";import d from"./types.js";const c=h(),$=async(t="",n="",a="")=>{const r=await p(_(`${n}/${t}?v=${new Date().getTime()}`));if(r&&d.is_object(r)){const e=r[a];return e||r}return{}},w=(t="",n=[],a="")=>{let r=[];t&&r.push(t);const i=n?.filter(e=>!e?.includes("*"));return r.push(...i),(c?.config?.i18n?.defaultLanguage||c?.config?.i18n?.default_language)&&r.push(c?.config?.i18n?.defaultLanguage||c?.config?.i18n?.default_language),r?.flatMap(e=>{const s=[e];return e?.length===2&&s.push(`${e.substring(0,2)}-`),e?.length>2&&(s.push(`${e?.split("-")[0]}`),s.push(`${e?.split("-")[0]}-`)),s})?.map(e=>e[e.length-1]==="-"?new RegExp(a?`^${a}_${e}[A-Z]+.js`:`^${e}[A-Z]+.js`,"g"):new RegExp(a?`^${a}_${e}.js`:`^${e}.js`,"g"))},b=(t="")=>t.split(",")?.map(a=>a.split(";")[0]),j=async(t={})=>{const n=t?.is_email?`${t?.joystick_build_path}i18n/email`:`${t?.joystick_build_path}i18n`,a=await m(n)&&g.readdirSync(n)||[],r=t?.is_email?[]:b(t?.req?.headers["accept-language"]),i=w(t?.req?.context?.user?.language,r,t?.email_template_name);let e=null;for(let l=0;l<i.length;l+=1){const u=i[l],f=a.find(o=>!!o.match(u));if(f){e=f;break}}return(e?await $(e,n,t?.render_component_path):null)||{}};var E=j;export{E as default};
