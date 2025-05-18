import j from"fs";import{parseHTML as o}from"linkedom";import k from"os";import v from"../api/get_api_for_data_functions.js";import O from"../../lib/get_browser_safe_request.js";import S from"../settings/load.js";import N from"./set_base_attributes_in_html.js";import q from"./set_head_tags_in_html.js";import u from"../../lib/path_exists.js";import J from"../accounts/get_browser_safe_user.js";const{readFile:y}=j.promises,n=S(),p=process.env.NODE_ENV==="development",{document:x}=o("<div></div>"),E=(e={})=>{let t=e?.base_html;if(console.log("PROPS AT RENDER",e?.props),e?.mod_theme){const c=o(t);c.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=c.document.toString()}return t.replace("${css}",`
			${e?.mod_css?`<style type="text/css" mod-css>${e?.mod_css}</style>`:""}
			<style type="text/css" js-css>${e?.css}</style>
		`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script>
				window.joystick = {
					settings: {
						global: ${JSON.stringify(n?.global)},
						public: ${JSON.stringify(n?.public)},
					},
				};

        window.__joystick_platform__ = '${k.platform()}';
        window.__joystick_data__ = ${JSON.stringify(e?.data)};
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${p?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(O(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:n?.global,public:n?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(J(e?.req?.context?.user))};
			</script>
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${p?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},R=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),P=(e={})=>e?.is_email?R(e):E(e),T=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.html`)?y(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),A=async(e="")=>await u(`email/${e?`base_${e}`:"base"}.css`)?y(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),C=(e=null,t={})=>e(t),D=async(e={})=>{const t=C(e?.component_to_render,e?.component_options),c=v(e?.req,e?.res,e?.api_schema),h=[],r=await t.render_for_ssr(c,e?.req,h,{linkedom_document:x,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return r?.data;const f=e?.is_email?await A(e?.email_options?.base_html_name):null,b=e?.is_email?await T(e?.email_options?.base_html_name):null;let i="";if(e?.mod?.in_use&&!e?.mod?.components_in_use&&(i=e?.mod?.css[e?.mod?.theme]),e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0){const l=e?.mod?.theme==="light"?"dark":"light",m={...e?.mod?.css?.globals};delete m[l],i+=Object.values(m||{})?.reduce((_="",d="")=>(_+=d,_),"");const a=Object.entries(e?.mod?.css?.components)?.filter(([_]="")=>e?.mod?.components_in_use?.includes(_));for(let _=0;_<a?.length;_+=1){const[d,w]=a[_];i+=w[e?.mod?.theme]}}const $=P({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?b:e?.base_html,component_instance:t,css:e?.is_email?`
			${f}
			${r?.css}
		`:r?.css,mod_css:i,mod_theme:e?.mod?.theme,data:Object.entries(r?.data||{})?.reduce((l={},[m,a])=>(l[m]=a?Buffer.from(JSON.stringify(a),"utf8").toString("base64"):"",l),{}),email_options:e?.email_options,head:e?.head,html:r?.html,props:e?.component_options?.props,render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),g=q($,e?.head,e?.req),s=N(g,e?.attributes);return console.log(s),s};var Q=D;export{Q as default};
