import u from"fs";import{parseHTML as p}from"linkedom";import y from"os";import $ from"../api/get_api_for_data_functions.js";import f from"../../lib/get_browser_safe_request.js";import h from"../settings/load.js";import w from"./set_base_attributes_in_html.js";import b from"./set_head_tags_in_html.js";import i from"../../lib/path_exists.js";import g from"../accounts/get_browser_safe_user.js";const{readFile:a}=u.promises,_=h(),s=process.env.NODE_ENV==="development",{document:j}=p("<div></div>"),k=(e={})=>e?.base_html.replace("${css}",`<style type="text/css" js-css>${e?.css}</style>`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script>
				window.joystick = {
					settings: {
						global: ${JSON.stringify(_?.global)},
						public: ${JSON.stringify(_?.public)},
					},
				};

        window.__joystick_platform__ = '${y.platform()}';
        window.__joystick_data__ = '${Buffer.from(JSON.stringify(e?.data),"utf8").toString("base64")}';
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${s?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(f(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:_?.global,public:_?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(g(e?.req?.context?.user))};
			</script>
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${s?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`),v=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),N=(e={})=>e?.is_email?v(e):k(e),O=async(e="")=>await i(`email/${e?`base_${e}`:"base"}.html`)?a(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),S=async(e="")=>await i(`email/${e?`base_${e}`:"base"}.css`)?a(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),q=(e=null,t={})=>e(t),J=async(e={})=>{const t=q(e?.component_to_render,e?.component_options),c=$(e?.req,e?.api_schema),l=[],r=await t.render_for_ssr(c,e?.req,l,{linkedom_document:j,is_email:e?.is_email}),n=e?.is_email?await S(e?.email_options?.base_html_name):null,o=e?.is_email?await O(e?.email_options?.base_html_name):null,m=N({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?o:e?.base_html,component_instance:t,css:e?.is_email?`
			${n}
			${r?.css}
		`:r?.css,data:r?.data,email_options:e?.email_options,head:e?.head,html:r?.html,props:e?.component_options?.props,render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),d=b(m,e?.head,e?.req);return w(d,e?.attributes)};var P=J;export{P as default};
