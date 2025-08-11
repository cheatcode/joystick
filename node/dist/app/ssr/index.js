import N from"fs";import{parseHTML as u}from"linkedom";import S from"os";import q from"../api/get_api_for_data_functions.js";import J from"../../lib/get_browser_safe_request.js";import x from"../settings/load.js";import C from"./set_base_attributes_in_html.js";import E from"./set_head_tags_in_html.js";import h from"../../lib/path_exists.js";import I from"../accounts/get_browser_safe_user.js";import T from"../../lib/get_language_preference.js";import y from"../../lib/escape_html.js";import c from"./escape_ssr_data.js";const{readFile:p}=N.promises,i=x(),f=process.env.NODE_ENV==="development",{document:A}=u("<div></div>"),B=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const r=u(t);r.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=r.document.toString()}return t.replace("${css}",`
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

        window.__joystick_platform__ = '${S.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${f?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(c(J(e?.req)))};
        window.__joystick_settings__ = ${JSON.stringify({global:i?.global,public:i?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(c(e?.props))};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(c(I(e?.req?.context?.user)))};
        window.__joystick_language__ = ${JSON.stringify(e?.language)};
			</script>
			${e?.mod_in_use&&!e?.mod_tree_shaking?'<script src="/_joystick/mod/mod.js"></script>':""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${f?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},D=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",y(e?.email_options?.subject||"")).replace("${preheader}",y(e?.email_options?.preheader||"")).replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),F=(e={})=>e?.is_email?D(e):B(e),H=async(e="")=>{const t=`${e?`base_${e}`:"base"}.html`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await h(`email/${t}`)?p(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},L=async(e="")=>{const t=`${e?`base_${e}`:"base"}.css`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await h(`email/${t}`)?p(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},M=(e=null,t={})=>e(t),P=async(e={})=>{const t=M(e?.component_to_render,e?.component_options),r=q(e?.req,e?.res,e?.api_schema),g=[],a=await t.render_for_ssr(r,e?.req,g,{linkedom_document:A,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return a?.data;const b=e?.is_email?await L(e?.email_options?.base_html_name):null,$=e?.is_email?await H(e?.email_options?.base_html_name):null;let m="",j="";const l=e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0;if(l){const v=e?.mod?.theme==="light"?"dark":"light",n={...e?.mod?.css?.globals};delete n[v],m+=Object.values(n||{})?.reduce((_="",o="")=>(_+=o,_),"");const d=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<d?.length;_+=1){const[o,O]=d[_];m+=O[e?.mod?.theme]}}const s=T(e?.req),w=F({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?$:e?.base_html,component_instance:t,css:e?.is_email?`
			${b}
			${a?.css}
		`:a?.css,mod_version:e?.mod?.version,mod_in_use:e?.mod?.in_use,mod_tree_shaking:l,mod_css:m,mod_js:j,mod_theme:e?.mod?.theme,data:a?.data,email_options:e?.email_options,head:e?.head,html:a?.html,language:s,props:{theme:e?.mod?.theme,language:s,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),k=E(w,e?.head,e?.req);return C(k,e?.attributes)};var ae=P;export{ae as default};
