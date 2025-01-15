import w from"fs";import{parseHTML as g}from"linkedom";import j from"os";import k from"../api/get_api_for_data_functions.js";import v from"../../lib/get_browser_safe_request.js";import O from"../settings/load.js";import N from"./set_base_attributes_in_html.js";import S from"./set_head_tags_in_html.js";import n from"../../lib/path_exists.js";import"../../lib/tree_shake_mod_css.js";import J from"../accounts/get_browser_safe_user.js";import q from"../../lib/get_mod_css_from_map.js";const{readFile:o}=w.promises,c=O(),u=process.env.NODE_ENV==="development",{document:x}=g("<div></div>"),E=(e={})=>e?.base_html.replace("${css}",`
			<style type="text/css" js-css>${e?.css}</style>
			${e?.mod_css?`<style type="text/css" mod-css>${e?.mod_css}</style>`:""}
		`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script>
				window.joystick = {
					settings: {
						global: ${JSON.stringify(c?.global)},
						public: ${JSON.stringify(c?.public)},
					},
				};

        window.__joystick_platform__ = '${j.platform()}';
        window.__joystick_data__ = ${JSON.stringify(e?.data)};
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${u?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(v(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:c?.global,public:c?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(J(e?.req?.context?.user))};
			</script>
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${u?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`),C=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),T=(e={})=>e?.is_email?C(e):E(e),B=async(e="")=>await n(`email/${e?`base_${e}`:"base"}.html`)?o(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),D=async(e="")=>await n(`email/${e?`base_${e}`:"base"}.css`)?o(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),F=(e=null,r={})=>e(r),H=async(e={})=>{const r=F(e?.component_to_render,e?.component_options),p=k(e?.req,e?.api_schema),y=[],t=await r.render_for_ssr(p,e?.req,y,{linkedom_document:x,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return t?.data;const f=e?.is_email?await D(e?.email_options?.base_html_name):null,h=e?.is_email?await B(e?.email_options?.base_html_name):null;let i="";const s=e?.mod?.theme,l=e?.mod?.plus?.css?.light||e?.mod?.plus?.css?.dark,m=e?.mod?.free?.css?.light||e?.mod?.free?.css?.dark;if((l||m)&&e?.mod?.keep?.length===0&&(i=(e?.mod?.plus?.css||e?.mod?.free?.css)[s]),(l&&e?.mod?.plus?.map||m&&e?.mod?.free?.map)&&e?.mod?.keep?.length>0){const _=e?.mod?.plus?.map||e?.mod?.free?.map,a=q(_,e?.mod?.keep||[],s);console.log("YES",a),i+=a}const $=T({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?h:e?.base_html,component_instance:r,css:e?.is_email?`
			${f}
			${t?.css}
		`:t?.css,mod_css:i,data:Object.entries(t?.data||{})?.reduce((_={},[a,d])=>(_[a]=d?Buffer.from(JSON.stringify(d),"utf8").toString("base64"):"",_),{}),email_options:e?.email_options,head:e?.head,html:t?.html,props:e?.component_options?.props,render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),b=S($,e?.head,e?.req);return N(b,e?.attributes)};var X=H;export{X as default};
