import v from"fs";import{parseHTML as d}from"linkedom";import O from"os";import S from"../api/get_api_for_data_functions.js";import N from"../../lib/get_browser_safe_request.js";import q from"../settings/load.js";import x from"./set_base_attributes_in_html.js";import J from"./set_head_tags_in_html.js";import o from"../../lib/path_exists.js";import A from"../accounts/get_browser_safe_user.js";import u from"../../lib/escape_html.js";import"./escape_ssr_data.js";const{readFile:p}=v.promises,c=q(),y=process.env.NODE_ENV==="development",{document:C}=d("<div></div>"),E=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const r=d(t);r.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=r.document.toString()}return t.replace("${css}",`
			${e?.mod_in_use&&!e?.mod_tree_shaking?` <link rel="stylesheet" href="/_joystick/mod/mod-${e?.mod_theme}.css">`:""}
			${e?.mod_in_use&&e?.mod_tree_shaking&&e?.mod_css?`<style type="text/css" mod-css>${e?.mod_css}</style>`:""}
			<style type="text/css" js-css>${e?.css}</style>
		`).replace('<div id="app"></div>',`
			<div id="app">${e?.html}</div>
			<script type="application/json" id="__joystick_data__">
				${JSON.stringify(e?.data||{})}
			</script>
			<script>
			  const escape_html = (string = '') => {
			    return String(string)
			      .replace(/&/g, '&amp;')
			      .replace(/</g, '&lt;')
			      .replace(/>/g, '&gt;')
			      .replace(/"/g, '&quot;')
			      .replace(/'/g, '&#39;')
			      .replace(/\\//g, '&#x2F;')
			      .replace(/\`/g, '&#x60;')
			      .replace(/=/g, '&#x3D;');
			  };

			  const escape_ssr_data = (data) => {
			    if (data === null || data === undefined) {
			      return data;
			    }

			    if (typeof data === 'string') {
			      return escape_html(data);
			    }

			    if (typeof data === 'number' || typeof data === 'boolean') {
			      return data;
			    }

			    if (Array.isArray(data)) {
			      return data.map(item => escape_ssr_data(item));
			    }

			    if (typeof data === 'object') {
			      const escaped_object = {};
			      for (const [key, value] of Object.entries(data)) {
			        escaped_object[key] = escape_ssr_data(value);
			      }
			      return escaped_object;
			    }

			    return data;
			  };

			  const raw_data = JSON.parse(document.getElementById('__joystick_data__').textContent || '{}');
			  const data = escape_ssr_data(raw_data);

				window.joystick = {
					settings: {
						global: ${JSON.stringify(c?.global)},
						public: ${JSON.stringify(c?.public)},
					},
				};

        window.__joystick_platform__ = '${O.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${y?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(N(e?.req))};
        window.__joystick_settings__ = ${JSON.stringify({global:c?.global,public:c?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(e?.props)};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(A(e?.req?.context?.user))};
			</script>
			${e?.mod_in_use&&!e?.mod_tree_shaking?'<script src="/_joystick/mod/mod.js"></script>':""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${y?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},D=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",u(e?.email_options?.subject||"")).replace("${preheader}",u(e?.email_options?.preheader||"")).replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),F=(e={})=>e?.is_email?D(e):E(e),I=async(e="")=>{const t=`${e?`base_${e}`:"base"}.html`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await o(`email/${t}`)?p(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},T=async(e="")=>{const t=`${e?`base_${e}`:"base"}.css`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await o(`email/${t}`)?p(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},B=(e=null,t={})=>e(t),H=async(e={})=>{const t=B(e?.component_to_render,e?.component_options),r=S(e?.req,e?.res,e?.api_schema),h=[],_=await t.render_for_ssr(r,e?.req,h,{linkedom_document:C,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return _?.data;const f=e?.is_email?await T(e?.email_options?.base_html_name):null,b=e?.is_email?await I(e?.email_options?.base_html_name):null;let i="",g="";const s=e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0;if(s){const w=e?.mod?.theme==="light"?"dark":"light",m={...e?.mod?.css?.globals};delete m[w],i+=Object.values(m||{})?.reduce((a="",n="")=>(a+=n,a),"");const l=Object.entries(e?.mod?.css?.components)?.filter(([a]="")=>e?.mod?.components_in_use?.includes(a));for(let a=0;a<l?.length;a+=1){const[n,k]=l[a];i+=k[e?.mod?.theme]}}const j=F({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?b:e?.base_html,component_instance:t,css:e?.is_email?`
			${f}
			${_?.css}
		`:_?.css,mod_version:e?.mod?.version,mod_in_use:e?.mod?.in_use,mod_tree_shaking:s,mod_css:i,mod_js:g,mod_theme:e?.mod?.theme,data:_?.data,email_options:e?.email_options,head:e?.head,html:_?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),$=J(j,e?.head,e?.req);return x($,e?.attributes)};var ee=H;export{ee as default};
