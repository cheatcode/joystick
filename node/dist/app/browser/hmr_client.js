var i=null,c=0,l=(t={},e=null)=>{let o=new WebSocket(`ws://localhost:${window.__joystick_hmr_port__}/_joystick/hmr?${new URLSearchParams(t.query).toString()}`);i&&(clearInterval(i),i=null);let _={client:o,send:(n={})=>(t.queryParams&&(n={...n,...t.queryParams}),o.send(JSON.stringify(n)))};return o.addEventListener("open",()=>{console.log("[hmr] Listening for changes..."),c=0,e&&e(_)}),o.addEventListener("message",n=>{n?.data&&t.onMessage&&t.onMessage(JSON.parse(n.data),_)}),o.addEventListener("close",()=>{console.log("[hmr] Disconnected from server."),o=null,t.autoReconnect&&!i&&(i=setInterval(()=>{o=null,c<12?(l(t,e),console.log(`[hmr] Attempting to reconnect (${c+1}/12)...`),c+=1):(console.log("[hmr] Reconnection attempts exhausted. Server is unavailable."),clearInterval(i))},5e3))}),_},u=async()=>{let t=await d();window.joystick.mount(t,Object.assign({},window.__joystick_ssr_props__),document.getElementById("app"))},d=async()=>(await import(`${window.__joystick_page_url__}?v=${new Date().getTime()}`).catch(e=>{location.reload()}))?.default,p=async()=>(await import(`${window.__joystick_layout_url__}?v=${new Date().getTime()}`).catch(e=>{location.reload()}))?.default,y=async()=>{let t=await p(),e=await d();window.joystick.mount(t,Object.assign({page:e},window.__joystick_ssr_props__),document.getElementById("app"))},w=t=>{let e=document.createElement("link");e.setAttribute("rel","stylesheet"),e.setAttribute("href","/_joystick/index.css"),document.head.replaceChild(e,t)},g=(t={})=>{let e=document.createElement("script");e.setAttribute("type","text/javascript"),e.setAttribute("src","/_joystick/index.client.js"),t.parentNode.replaceChild(e,t)},m=l({autoReconnect:!0,query:{user_language:window?.__joystick_user__?.language||"",browser_language:navigator?.language||"",page_component_path:window.__joystick_page_url__?.replace("/_joystick/","")},onMessage:async(t={},e={})=>{if(t&&t.type&&t.type==="BUILD_ERROR")return location.reload();window.__joystick_hmr_update__=!0,window.__joystick_hmr_previous_tree__=[...window.joystick._internal.tree||[]],window.__joystick_hmr_previous_websockets__=[...window.joystick._internal.websockets||[]];let _=Object.assign({},{scrollTop:window.scrollY}),n=t&&t.type&&t.type==="FILE_CHANGE",r=!!window.__joystick_layout_url__&&!!window.__joystick_page_url__,s=document.head.querySelector('link[href="/_joystick/index.css"]'),a=document.body.querySelector('script[src="/_joystick/index.client.js"]');t?.index_html_changed&&location.reload(),t?.i18n&&(window.__joystick_i18n__=t?.i18n),t?.settings&&(window.__joystick_settings__=t?.settings,window.joystick.settings=t?.settings),a&&t?.index_client_changed&&g(a),s&&t?.index_css_changed&&w(s),n&&r&&y(e),n&&!r&&u(e),window.scrollTo(0,_.scrollTop),e.send&&e.send({type:"HMR_UPDATE_COMPLETE"})}}),j=m;export{j as default};
