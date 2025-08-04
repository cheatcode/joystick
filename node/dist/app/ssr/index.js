import v from"fs";import{parseHTML as d}from"linkedom";import O from"os";import N from"../api/get_api_for_data_functions.js";import S from"../../lib/get_browser_safe_request.js";import q from"../settings/load.js";import J from"./set_base_attributes_in_html.js";import x from"./set_head_tags_in_html.js";import o from"../../lib/path_exists.js";import C from"../accounts/get_browser_safe_user.js";import u from"../../lib/escape_html.js";import E from"./escape_ssr_data.js";const{readFile:h}=v.promises,i=q(),y=process.env.NODE_ENV==="development",{document:I}=d("<div></div>"),T=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const r=d(t);r.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=r.document.toString()}return t.replace("${css}",`
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

        window.__joystick_platform__ = '${O.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${y?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(S(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:i?.global,public:i?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(C(e?.req?.context?.user))};
			</script>
			${e?.mod_in_use&&!e?.mod_tree_shaking?'<script src="/_joystick/mod/mod.js"></script>':""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${y?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},A=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",u(e?.email_options?.subject||"")).replace("${preheader}",u(e?.email_options?.preheader||"")).replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),B=(e={})=>e?.is_email?A(e):T(e),D=async(e="")=>{const t=`${e?`base_${e}`:"base"}.html`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await o(`email/${t}`)?h(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},F=async(e="")=>{const t=`${e?`base_${e}`:"base"}.css`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await o(`email/${t}`)?h(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},H=(e=null,t={})=>e(t),L=async(e={})=>{const t=H(e?.component_to_render,e?.component_options),r=N(e?.req,e?.res,e?.api_schema),p=[],a=await t.render_for_ssr(r,e?.req,p,{linkedom_document:I,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return a?.data;const f=e?.is_email?await F(e?.email_options?.base_html_name):null,b=e?.is_email?await D(e?.email_options?.base_html_name):null;let m="",$="";const c=e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0;if(c){const w=e?.mod?.theme==="light"?"dark":"light",s={...e?.mod?.css?.globals};delete s[w],m+=Object.values(s||{})?.reduce((_="",n="")=>(_+=n,_),"");const l=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<l?.length;_+=1){const[n,k]=l[_];m+=k[e?.mod?.theme]}}const g=B({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?b:e?.base_html,component_instance:t,css:e?.is_email?`
			${f}
			${a?.css}
		`:a?.css,mod_version:e?.mod?.version,mod_in_use:e?.mod?.in_use,mod_tree_shaking:c,mod_css:m,mod_js:$,mod_theme:e?.mod?.theme,data:E(a?.data),email_options:e?.email_options,head:e?.head,html:a?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),j=x(g,e?.head,e?.req);return J(j,e?.attributes)};var ee=L;export{ee as default};
