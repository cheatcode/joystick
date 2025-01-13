import b from"fs";import{parseHTML as g}from"linkedom";import j from"os";import k from"../api/get_api_for_data_functions.js";import v from"../../lib/get_browser_safe_request.js";import O from"../settings/load.js";import S from"./set_base_attributes_in_html.js";import N from"./set_head_tags_in_html.js";import i from"../../lib/path_exists.js";import J from"../../lib/tree_shake_mod_css.js";import q from"../accounts/get_browser_safe_user.js";const{readFile:o}=b.promises,c=O(),m=process.env.NODE_ENV==="development",{document:x}=g("<div></div>"),C=(e={})=>e?.base_html.replace("${css}",`<style type="text/css" js-css>${e?.css}</style>`).replace('<div id="app"></div>',`
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
        ${m?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(v(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:c?.global,public:c?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(q(e?.req?.context?.user))};
			</script>
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${m?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`),M=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),E=(e={})=>e?.is_email?M(e):C(e),F=async(e="")=>await i(`email/${e?`base_${e}`:"base"}.html`)?o(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),T=async(e="")=>await i(`email/${e?`base_${e}`:"base"}.css`)?o(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),B=(e=null,_={})=>e(_),n=async(e={})=>{const _=B(e?.component_to_render,e?.component_options),d=k(e?.req,e?.api_schema),u=[],t=await _.render_for_ssr(d,e?.req,u,{linkedom_document:x,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return t?.data;const p=e?.is_email?await T(e?.email_options?.base_html_name):null,y=e?.is_email?await F(e?.email_options?.base_html_name):null;let l="";if(n?.mod?.theme){const r=`private/mod/mod-${n?.mod?.theme}-plus.min.css`,a=`private/mod/mod-${n?.mod?.theme}.min.css`,s=await i(r),$=await i(a);if(!s&&!$){console.warn("You passed a mod options object to a res.render() call but Mod could not be found in your app. Follow the instructions here to ensure Joystick can find Mod's CSS files in your app: https://docs.cheatcode.co/mod/getting-started/using-mod-with-joystick");return}const w=await o(s?r:a,"utf-8");l=await J(t?.html,w)}const h=E({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?y:e?.base_html,component_instance:_,css:e?.is_email?`
			${p}
			${t?.css}
		`:`${l}
${t?.css}`,data:Object.entries(t?.data||{})?.reduce((r={},[a,s])=>(r[a]=s?Buffer.from(JSON.stringify(s),"utf8").toString("base64"):"",r),{}),email_options:e?.email_options,head:e?.head,html:t?.html,props:e?.component_options?.props,render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),f=N(h,e?.head,e?.req);return S(f,e?.attributes)};var U=n;export{U as default};
