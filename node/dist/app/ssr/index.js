import g from"fs";import{parseHTML as n}from"linkedom";import k from"os";import v from"../api/get_api_for_data_functions.js";import O from"../../lib/get_browser_safe_request.js";import S from"../settings/load.js";import N from"./set_base_attributes_in_html.js";import q from"./set_head_tags_in_html.js";import u from"../../lib/path_exists.js";import J from"../accounts/get_browser_safe_user.js";const{readFile:y}=g.promises,d=S(),h=process.env.NODE_ENV==="development",{document:x}=n("<div></div>"),L=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const a=n(t);a.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=a.document.toString()}return t.replace("${css}",`
			${e?.mod_css?`<style type="text/css" mod-css>${e?.mod_css}</style>`:""}
			<style type="text/css" js-css>${e?.css}</style>
		`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script>
				window.joystick = {
					settings: {
						global: ${JSON.stringify(d?.global)},
						public: ${JSON.stringify(d?.public)},
					},
				};

        window.__joystick_platform__ = '${k.platform()}';
        window.__joystick_data__ = ${JSON.stringify(e?.data)};
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${h?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(O(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:d?.global,public:d?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(J(e?.req?.context?.user))};
			</script>
			window.__joystick_mod_js__ = '${e?.mod_js?Buffer.from(e.mod_js).toString("base64"):""}';
			${e?.mod_js?`
				<script type="module">
					try {
						const js_code = atob(window.__joystick_mod_js__);
						const module_blob = new Blob([js_code], { type: 'text/javascript' });
						const module_url = URL.createObjectURL(module_blob);
						const mod_module = await import(module_url);
						window.__mod_js__ = mod_module.default;
						URL.revokeObjectURL(module_url);
					} catch (error) {
						console.error('Failed to load mod module:', error);
					}
				</script>
				`:""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${h?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},R=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),U=(e={})=>e?.is_email?R(e):L(e),B=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.html`)?y(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),C=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.css`)?y(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),E=(e=null,t={})=>e(t),F=async(e={})=>{const t=E(e?.component_to_render,e?.component_options),a=v(e?.req,e?.res,e?.api_schema),p=[],r=await t.render_for_ssr(a,e?.req,p,{linkedom_document:x,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return r?.data;const b=e?.is_email?await C(e?.email_options?.base_html_name):null,f=e?.is_email?await B(e?.email_options?.base_html_name):null;let m="",o="";if(e?.mod?.in_use&&!e?.mod?.components_in_use&&(m=e?.mod?.css[e?.mod?.theme]),e?.mod?.in_use&&(o=e?.mod?.js||""),e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0){const l=e?.mod?.theme==="light"?"dark":"light",i={...e?.mod?.css?.globals};delete i[l],m+=Object.values(i||{})?.reduce((_="",s="")=>(_+=s,_),"");const c=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<c?.length;_+=1){const[s,$]=c[_];m+=$[e?.mod?.theme]}}const j=U({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?f:e?.base_html,component_instance:t,css:e?.is_email?`
			${b}
			${r?.css}
		`:r?.css,mod_css:m,mod_js:o||"",mod_theme:e?.mod?.theme,data:Object.entries(r?.data||{})?.reduce((l={},[i,c])=>(l[i]=c?Buffer.from(JSON.stringify(c),"utf8").toString("base64"):"",l),{}),email_options:e?.email_options,head:e?.head,html:r?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),w=q(j,e?.head,e?.req);return N(w,e?.attributes)};var Q=F;export{Q as default};
