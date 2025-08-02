import g from"fs";import{parseHTML as o}from"linkedom";import k from"os";import v from"../api/get_api_for_data_functions.js";import O from"../../lib/get_browser_safe_request.js";import N from"../settings/load.js";import S from"./set_base_attributes_in_html.js";import x from"./set_head_tags_in_html.js";import u from"../../lib/path_exists.js";import q from"../accounts/get_browser_safe_user.js";const{readFile:p}=g.promises,i=N(),y=process.env.NODE_ENV==="development",{document:J}=o("<div></div>"),C=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const r=o(t);r.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=r.document.toString()}const m=JSON.stringify(e?.data).replace(/</g,"\\u003c").replace(/-->/g,"--\\>").replace(/<\/script/gi,"<\\/script");return t.replace("${css}",`
			${e?.mod_css?`<style type="text/css" mod-css>${e?.mod_css}</style>`:""}
			<style type="text/css" js-css>${e?.css}</style>
		`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script type="application/json" id="__joystick_data__">
				${m}
			</script>
			<script type="text/plain" id="__joystick_mod_js__">
				${e?.mod_js}
			</script>
			<script>
			  const data = JSON.parse(document.getElementById('__joystick_data__')?.textContent || '{}');

				window.joystick = {
					settings: {
						global: ${JSON.stringify(i?.global)},
						public: ${JSON.stringify(i?.public)},
					},
				};

        window.__joystick_platform__ = '${k.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${y?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(O(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:i?.global,public:i?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(q(e?.req?.context?.user))};
			</script>
			${e?.mod_js?`
			<script type="module">
				try {
					const mod_js = document.getElementById('__joystick_mod_js__')?.textContent || '';
					
					if (mod_js) {					
						const data_url = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(mod_js);
						const mod_module = await import(data_url);
						window.__mod_js__ = mod_module.default;
					}
				} catch (error) {
					console.error(error);
				}
			</script>`:""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${y?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},E=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),I=(e={})=>e?.is_email?E(e):C(e),B=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.html`)?p(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),R=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.css`)?p(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),T=(e=null,t={})=>e(t),A=async(e={})=>{const t=T(e?.component_to_render,e?.component_options),m=v(e?.req,e?.res,e?.api_schema),r=[],a=await t.render_for_ssr(m,e?.req,r,{linkedom_document:J,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return a?.data;const h=e?.is_email?await R(e?.email_options?.base_html_name):null,f=e?.is_email?await B(e?.email_options?.base_html_name):null;let c="",l="";if(e?.mod?.in_use&&!e?.mod?.components_in_use&&(c=e?.mod?.css[e?.mod?.theme]),e?.mod?.in_use&&(l=e?.mod?.js||""),e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0){const b=e?.mod?.theme==="light"?"dark":"light",d={...e?.mod?.css?.globals};delete d[b],c+=Object.values(d||{})?.reduce((_="",n="")=>(_+=n,_),"");const s=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<s?.length;_+=1){const[n,w]=s[_];c+=w[e?.mod?.theme]}}const j=I({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?f:e?.base_html,component_instance:t,css:e?.is_email?`
			${h}
			${a?.css}
		`:a?.css,mod_css:c,mod_js:l||"",mod_theme:e?.mod?.theme,data:a?.data,email_options:e?.email_options,head:e?.head,html:a?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),$=x(j,e?.head,e?.req);return S($,e?.attributes)};var Q=A;export{Q as default};
