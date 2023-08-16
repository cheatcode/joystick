import{parseHTML as m}from"linkedom";import p from"@joystick.js/ui-canary";import d from"node-fetch";import{URL as u,URLSearchParams as h}from"url";import y from"./event.js";import w from"../load/index.js";const g=async(e="")=>{const t=new u(`${window?.location?.origin}/api/_test/bootstrap`);t.search=new h({pathToComponent:e});const o=await d(t).then(async r=>r.json());window.joystick={},window.joystick.settings={},window.__joystick_data__=o?.data||{},window.__joystick_i18n__=o?.translations||{},window.__joystick_req__=o?.req},_=()=>{const e=m(`
    <html>
      <head></head>
      <body>
        <div id="app"></div>
        <meta name="csrf" content="joystick_test" />
      </body>
    </html>
  `),{window:t,document:o,Element:r,Event:l,HTMLElement:c}=e;return global.window=t,global.document=o,global.HTMLElement=c,global.Element=r,global.Event=l,global.console={log:console.log,warn:console.warn,error:console.error},e};var v=async(e="",t={})=>{const o=_();window.fetch=d,window.location={origin:`http://localhost:${process.env.PORT}`},await g(e);const r=await w(e,{default:!0}),l=t?.layout?await w(t?.layout,{default:!0}):null,c={...t?.props||{}};t?.layout&&(c.page=r);const a=p.mount(l||r,c,o?.document.querySelector("#app"));return a.isTest=!0,{dom:o,instance:a,test:{data:async(n={})=>a?.data?.refetch(n),renderToHTML:()=>{const n=a?.renderToHTML(),s=new RegExp("<when>|</when>","g");return n?.wrapped?.replace(s,"")?.replace(/\n|\t/g," ")?.replace(/> *</g,"><")},method:(n="",...s)=>{const i=a?.methods[n];return i?i(...s):null},event:(n="",s="")=>y(n,s,o)}}};export{v as default};
