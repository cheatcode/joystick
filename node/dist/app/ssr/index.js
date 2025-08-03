import k from"fs";import{parseHTML as o}from"linkedom";import v from"os";import O from"../api/get_api_for_data_functions.js";import N from"../../lib/get_browser_safe_request.js";import S from"../settings/load.js";import q from"./set_base_attributes_in_html.js";import J from"./set_head_tags_in_html.js";import u from"../../lib/path_exists.js";import x from"../accounts/get_browser_safe_user.js";const{readFile:y}=k.promises,c=S(),h=process.env.NODE_ENV==="development",{document:C}=o("<div></div>"),E=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const a=o(t);a.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=a.document.toString()}const i=JSON.stringify(e?.data).replace(/</g,"\\u003c").replace(/-->/g,"--\\>").replace(/<\/script/gi,"<\\/script");return t.replace("${css}",`
			${e?.mod_in_use&&!e?.mod_tree_shaking?` <link rel="stylesheet" href="/_joystick/mod/mod-${e?.mod_theme}${e?.mod_version==="plus"?"-plus":""}.css">`:""}
			${e?.mod_in_use&&e?.mod_tree_shaking&&e?.mod_css?`<style type="text/css" mod-css>${e?.mod_css}</style>`:""}
			<style type="text/css" js-css>${e?.css}</style>
		`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script type="application/json" id="__joystick_data__">
				${i}
			</script>
			<script>
			  const data = JSON.parse(document.getElementById('__joystick_data__').textContent || '{}');

				window.joystick = {
					settings: {
						global: ${JSON.stringify(c?.global)},
						public: ${JSON.stringify(c?.public)},
					},
				};

        window.__joystick_platform__ = '${v.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${h?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(N(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:c?.global,public:c?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(x(e?.req?.context?.user))};
			</script>
			${e?.mod_in_use&&!e?.mod_tree_shaking?`<script type="module" src="/_joystick/mod/mod${e?.mod_version==="plus"?"-plus":""}.js"></script>`:""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${h?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},I=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),T=(e={})=>e?.is_email?I(e):E(e),A=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.html`)?y(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),B=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.css`)?y(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),D=(e=null,t={})=>e(t),F=async(e={})=>{const t=D(e?.component_to_render,e?.component_options),i=O(e?.req,e?.res,e?.api_schema),a=[],r=await t.render_for_ssr(i,e?.req,a,{linkedom_document:C,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return r?.data;const p=e?.is_email?await B(e?.email_options?.base_html_name):null,$=e?.is_email?await A(e?.email_options?.base_html_name):null;let m="",b="";const l=e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0;if(l){const w=e?.mod?.theme==="light"?"dark":"light",s={...e?.mod?.css?.globals};delete s[w],m+=Object.values(s||{})?.reduce((_="",n="")=>(_+=n,_),"");const d=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<d?.length;_+=1){const[n,j]=d[_];m+=j[e?.mod?.theme]}}const f=T({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?$:e?.base_html,component_instance:t,css:e?.is_email?`
			${p}
			${r?.css}
		`:r?.css,mod_version:e?.mod?.version,mod_in_use:e?.mod?.in_use,mod_tree_shaking:l,mod_css:m,mod_js:b,mod_theme:e?.mod?.theme,data:r?.data,email_options:e?.email_options,head:e?.head,html:r?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),g=J(f,e?.head,e?.req);return q(g,e?.attributes)};var W=F;export{W as default};
