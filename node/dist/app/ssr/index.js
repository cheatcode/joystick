import O from"fs";import{parseHTML as o}from"linkedom";import N from"os";import S from"../api/get_api_for_data_functions.js";import q from"../../lib/get_browser_safe_request.js";import J from"../settings/load.js";import x from"./set_base_attributes_in_html.js";import C from"./set_head_tags_in_html.js";import u from"../../lib/path_exists.js";import E from"../accounts/get_browser_safe_user.js";import h from"../../lib/escape_html.js";import c from"./escape_ssr_data.js";const{readFile:y}=O.promises,i=J(),p=process.env.NODE_ENV==="development",{document:I}=o("<div></div>"),T=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const r=o(t);r.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=r.document.toString()}return t.replace("${css}",`
			${e?.mod_in_use&&!e?.mod_tree_shaking?` <link rel="stylesheet" href="/_joystick/mod/mod-${e?.mod_theme}.css">`:""}
			${e?.mod_in_use&&e?.mod_tree_shaking&&e?.mod_css?`<style type="text/css" mod-css>${e?.mod_css}</style>`:""}
			<style type="text/css" js-css>${e?.css}</style>
		`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script type="application/json" id="__joystick_data__">
				${JSON.stringify(e?.data||{})}
			</script>
			<script>
			  const data = JSON.parse(document.getElementById('__joystick_data__').textContent || '{}');

				window.joystick = {
					settings: {
						global: ${JSON.stringify(i?.global)},
						public: ${JSON.stringify(i?.public)},
					},
				};

        window.__joystick_platform__ = '${N.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${p?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(c(q(e?.req)))};
        window.__joystick_settings__ = ${JSON.stringify({global:i?.global,public:i?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(c(e?.props))};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(c(E(e?.req?.context?.user)))};
			</script>
			${e?.mod_in_use&&!e?.mod_tree_shaking?'<script src="/_joystick/mod/mod.js"></script>':""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${p?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},A=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",h(e?.email_options?.subject||"")).replace("${preheader}",h(e?.email_options?.preheader||"")).replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),B=(e={})=>e?.is_email?A(e):T(e),D=async(e="")=>{const t=`${e?`base_${e}`:"base"}.html`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await u(`email/${t}`)?y(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},F=async(e="")=>{const t=`${e?`base_${e}`:"base"}.css`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await u(`email/${t}`)?y(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},H=(e=null,t={})=>e(t),L=async(e={})=>{const t=H(e?.component_to_render,e?.component_options),r=S(e?.req,e?.res,e?.api_schema),f=[],a=await t.render_for_ssr(r,e?.req,f,{linkedom_document:I,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return a?.data;const b=e?.is_email?await F(e?.email_options?.base_html_name):null,$=e?.is_email?await D(e?.email_options?.base_html_name):null;let m="",g="";const s=e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0;if(s){const k=e?.mod?.theme==="light"?"dark":"light",l={...e?.mod?.css?.globals};delete l[k],m+=Object.values(l||{})?.reduce((_="",d="")=>(_+=d,_),"");const n=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<n?.length;_+=1){const[d,v]=n[_];m+=v[e?.mod?.theme]}}const j=B({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?$:e?.base_html,component_instance:t,css:e?.is_email?`
			${b}
			${a?.css}
		`:a?.css,mod_version:e?.mod?.version,mod_in_use:e?.mod?.in_use,mod_tree_shaking:s,mod_css:m,mod_js:g,mod_theme:e?.mod?.theme,data:a?.data,email_options:e?.email_options,head:e?.head,html:a?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),w=C(j,e?.head,e?.req);return x(w,e?.attributes)};var ee=L;export{ee as default};
