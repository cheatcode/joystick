import g from"fs";import{parseHTML as s}from"linkedom";import k from"os";import v from"../api/get_api_for_data_functions.js";import O from"../../lib/get_browser_safe_request.js";import S from"../settings/load.js";import N from"./set_base_attributes_in_html.js";import q from"./set_head_tags_in_html.js";import u from"../../lib/path_exists.js";import J from"../accounts/get_browser_safe_user.js";const{readFile:y}=g.promises,d=S(),h=process.env.NODE_ENV==="development",{document:x}=s("<div></div>"),C=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const c=s(t);c.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=c.document.toString()}return t.replace("${css}",`
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
				window.__joystick_mod_js__ = '${Buffer.from(mod_js).toString("base64")||""}';
			</script>
			${e?.mod_js?`
			<script type="module">
				try {
					const mod_js = atob(window.__joystick_mod_js__);
					const data_url = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(mod_js);
					const mod_module = await import(data_url);
					window.__mod_js__ = mod_module.default;
				} catch (error) {
					console.error('Failed to load mod module:', error);
				}
			</script>`:""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${h?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},B=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),E=(e={})=>e?.is_email?B(e):C(e),F=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.html`)?y(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),I=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.css`)?y(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),R=(e=null,t={})=>e(t),T=async(e={})=>{const t=R(e?.component_to_render,e?.component_options),c=v(e?.req,e?.res,e?.api_schema),p=[],r=await t.render_for_ssr(c,e?.req,p,{linkedom_document:x,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return r?.data;const f=e?.is_email?await I(e?.email_options?.base_html_name):null,b=e?.is_email?await F(e?.email_options?.base_html_name):null;let i="",o="";if(e?.mod?.in_use&&!e?.mod?.components_in_use&&(i=e?.mod?.css[e?.mod?.theme]),e?.mod?.in_use&&(o=e?.mod?.js||""),e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0){const m=e?.mod?.theme==="light"?"dark":"light",l={...e?.mod?.css?.globals};delete l[m],i+=Object.values(l||{})?.reduce((_="",n="")=>(_+=n,_),"");const a=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<a?.length;_+=1){const[n,j]=a[_];i+=j[e?.mod?.theme]}}const $=E({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?b:e?.base_html,component_instance:t,css:e?.is_email?`
			${f}
			${r?.css}
		`:r?.css,mod_css:i,mod_js:o||"",mod_theme:e?.mod?.theme,data:Object.entries(r?.data||{})?.reduce((m={},[l,a])=>(m[l]=a?Buffer.from(JSON.stringify(a),"utf8").toString("base64"):"",m),{}),email_options:e?.email_options,head:e?.head,html:r?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),w=q($,e?.head,e?.req);return N(w,e?.attributes)};var Q=T;export{Q as default};
