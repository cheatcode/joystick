import f from"fs";import{parseHTML as $}from"linkedom";import h from"os";import b from"../api/get_api_for_data_functions.js";import w from"../../lib/get_browser_safe_request.js";import g from"../settings/load.js";import j from"./set_base_attributes_in_html.js";import k from"./set_head_tags_in_html.js";import s from"../../lib/path_exists.js";import v from"../accounts/get_browser_safe_user.js";const{readFile:c}=f.promises,_=g(),l=process.env.NODE_ENV==="development",{document:O}=$("<div></div>"),N=(e={})=>e?.base_html.replace("${css}",`<style type="text/css" js-css>${e?.css}</style>`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script>
				window.joystick = {
					settings: {
						global: ${JSON.stringify(_?.global)},
						public: ${JSON.stringify(_?.public)},
					},
				};

        window.__joystick_platform__ = '${h.platform()}';
        window.__joystick_data__ = ${JSON.stringify(e?.data)};
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${l?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(w(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:_?.global,public:_?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(v(e?.req?.context?.user))};
			</script>
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${l?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`),S=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),J=(e={})=>e?.is_email?S(e):N(e),q=async(e="")=>await s(`email/${e?`base_${e}`:"base"}.html`)?c(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),x=async(e="")=>await s(`email/${e?`base_${e}`:"base"}.css`)?c(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),C=(e=null,r={})=>e(r),E=async(e={})=>{const r=C(e?.component_to_render,e?.component_options),n=b(e?.req,e?.api_schema),m=[],t=await r.render_for_ssr(n,e?.req,m,{linkedom_document:O,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return t?.data;const o=e?.is_email?await x(e?.email_options?.base_html_name):null,d=e?.is_email?await q(e?.email_options?.base_html_name):null,u=J({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?d:e?.base_html,component_instance:r,css:e?.is_email?`
			${o}
			${t?.css}
		`:t?.css,data:Object.entries(t?.data||{})?.reduce((i={},[y,a])=>(i[y]=a?Buffer.from(JSON.stringify(a),"utf8").toString("base64"):"",i),{}),email_options:e?.email_options,head:e?.head,html:t?.html,props:e?.component_options?.props,render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),p=k(u,e?.head,e?.req);return j(p,e?.attributes)};var z=E;export{z as default};
