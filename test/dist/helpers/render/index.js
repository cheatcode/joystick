import{parseHTML as w}from"linkedom";import u from"joystick-ui-test";import m from"node-fetch";import{URL as p,URLSearchParams as g}from"url";import h from"./event.js";import d from"../load/index.js";import y from"../../lib/generate_cookie_header.js";const k=async(n="",t={})=>{const o=new p(`${window?.location?.origin}/api/_test/bootstrap`);o.search=new g({path_to_component:n});const a={cache:"no-store"};a.headers={"Accept-Language":t?.options?.language||"",Cookie:t?.user?y({joystick_login_token:t?.user?.joystick_login_token,joystick_login_token_expires_at:t?.user?.joystick_login_token_expires_at}):""};const e=await m(o,a).then(async s=>s.json());window.joystick={settings:e?.settings||{}},window.__joystick_test__=!0,window.__joystick_data__=e?.data||{},window.__joystick_i18n__=e?.translations||{},window.__joystick_req__=e?.req,window.__joystick_url__=t?.url||{params:{},path:"/",query:{},route:"/"}},f=()=>{const n=w(`
    <html>
      <head></head>
      <body>
        <div id="app"></div>
        <meta name="csrf" content="joystick_test" />
      </body>
    </html>
  `),{window:t,document:o,Element:a,Event:e,HTMLElement:s}=n;return global.window=t,global.document=o,global.HTMLElement=s,global.Element=a,global.Event=e,global.console={log:console.log,warn:console.warn,error:console.error},n},j=async(n="",t={})=>{const o=f();window.fetch=m,window.location={origin:`http://localhost:${process.env.PORT}`},await k(n,t);const a=await d(n,{default:!0}),e=t?.layout?await d(t?.layout,{default:!0}):null,s={...t?.props||{}};t?.layout&&(s.page=a);const l=u.mount(e||a,s,o?.document.querySelector("#app")),_=()=>{const r=l?.render_to_html(),c=new RegExp("<when>|</when>","g");return r?.replace(c,"")?.replace(/\n|\t/g," ")?.replace(/> *</g,"><")};return{dom:o,instance:l,test:{data:async(r={})=>l?.data?.refetch(r),renderToHTML:_,render_to_html:_,method:(r="",...c)=>{const i=l?.methods[r];return i?i(...c):null},event:(r="",c="",i={})=>h(r,c,o,i)}}};var H=j;export{H as default};
