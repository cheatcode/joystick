import w from"fs";import{parseHTML as g}from"linkedom";import j from"os";import k from"../api/get_api_for_data_functions.js";import v from"../../lib/get_browser_safe_request.js";import O from"../settings/load.js";import N from"./set_base_attributes_in_html.js";import S from"./set_head_tags_in_html.js";import m from"../../lib/path_exists.js";import J from"../accounts/get_browser_safe_user.js";const{readFile:d}=w.promises,n=O(),o=process.env.NODE_ENV==="development",{document:q}=g("<div></div>"),x=(e={})=>e?.base_html.replace("${css}",`
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

        window.__joystick_platform__ = '${j.platform()}';
        window.__joystick_data__ = ${JSON.stringify(e?.data)};
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${o?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(v(e?.req))};
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
      ${o?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`),C=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",e?.email_options?.subject).replace("${preheader}",e?.email_options?.preheader||"").replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),E=(e={})=>e?.is_email?C(e):x(e),T=async(e="")=>await m(`email/${e?`base_${e}`:"base"}.html`)?d(`email/${e?`base_${e}`:"base"}.html`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.html`),""),B=async(e="")=>await m(`email/${e?`base_${e}`:"base"}.css`)?d(`email/${e?`base_${e}`:"base"}.css`,"utf-8"):(console.warn(`Could not find email/${e?`base_${e}`:"base"}.css`),""),D=(e=null,a={})=>e(a),F=async(e={})=>{const a=D(e?.component_to_render,e?.component_options),u=k(e?.req,e?.api_schema),p=[],_=await a.render_for_ssr(u,e?.req,p,{linkedom_document:q,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return _?.data;const y=e?.is_email?await B(e?.email_options?.base_html_name):null,f=e?.is_email?await T(e?.email_options?.base_html_name):null;let i="";if(console.log(e?.mod?.css?.components),e?.mod?.in_use&&!e?.mod?.components_in_use&&(i=e?.mod?.css[e?.mod?.theme]),e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0){const c=e?.mod?.theme==="light"?"dark":"light",s={...e?.mod?.css?.base};delete s[c],i+=Object.values(s||{})?.reduce((t="",l="")=>(t+=l,t),"");const r=Object.entries(e?.mod?.css?.components)?.filter(([t]="")=>e?.mod?.components_in_use?.includes(t));for(let t=0;t<r?.length;t+=1){const[l,b]=r[t];i+=b}}const h=E({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?f:e?.base_html,component_instance:a,css:e?.is_email?`
			${y}
			${_?.css}
		`:_?.css,mod_css:i,data:Object.entries(_?.data||{})?.reduce((c={},[s,r])=>(c[s]=r?Buffer.from(JSON.stringify(r),"utf8").toString("base64"):"",c),{}),email_options:e?.email_options,head:e?.head,html:_?.html,props:e?.component_options?.props,render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),$=S(h,e?.head,e?.req);return N($,e?.attributes)};var Q=F;export{Q as default};
