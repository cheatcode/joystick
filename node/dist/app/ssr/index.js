import O from"fs";import{parseHTML as o}from"linkedom";import S from"os";import x from"../api/get_api_for_data_functions.js";import N from"../../lib/get_browser_safe_request.js";import q from"../settings/load.js";import J from"./set_base_attributes_in_html.js";import E from"./set_head_tags_in_html.js";import u from"../../lib/path_exists.js";import A from"../accounts/get_browser_safe_user.js";import p from"../../lib/escape_html.js";import i from"./escape_ssr_data.js";const{readFile:y}=O.promises,c=q(),h=process.env.NODE_ENV==="development",{document:C}=o("<div></div>"),D=(e={})=>{let t=e?.base_html;if(e?.mod_theme){const r=o(t);r.document.querySelector("body").setAttribute("data-mod-theme",e?.mod_theme),t=r.document.toString()}return t.replace("${css}",`
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

			  const is_plain_object = (obj) => {
			    return obj !== null && 
			           typeof obj === 'object' && 
			           (obj.constructor === Object || obj.constructor === undefined);
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

			    if (is_plain_object(data)) {
			      const escaped_object = {};
			      for (const [key, value] of Object.entries(data)) {
			        escaped_object[key] = escape_ssr_data(value);
			      }
			      return escaped_object;
			    }

			    // For all other objects (Date, RegExp, custom classes, etc.), return as-is
			    return data;
			  };

			  const parsed_data = JSON.parse(document.getElementById('__joystick_data__').textContent || '{}');
				console.log({ parsed_data });
			  const data = escape_ssr_data(parsed_data);
				console.log({ reescaped_data: data });

				window.joystick = {
					settings: {
						global: ${JSON.stringify(c?.global)},
						public: ${JSON.stringify(c?.public)},
					},
				};

        window.__joystick_platform__ = '${S.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(e?.translations)};
        ${h?`window.__joystick_hmr_port__ = ${parseInt(process.env.PORT,10)+1}`:""}
        window.__joystick_layout_url__ = ${e?.render_layout_path?`"/_joystick/${e?.render_layout_path}"`:null};
        window.__joystick_page_url__ = ${e?.render_component_path?`"/_joystick/${e?.render_component_path}"`:null};
       	window.__joystick_request__ = ${JSON.stringify(i(N(e?.req)))};
        window.__joystick_settings__ = ${JSON.stringify({global:c?.global,public:c?.public})};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(i(e?.props))};
        window.__joystick_url__ = ${JSON.stringify(e?.url)};
        window.__joystick_user__ = ${JSON.stringify(i(A(e?.req?.context?.user)))};
			</script>
			${e?.mod_in_use&&!e?.mod_tree_shaking?'<script src="/_joystick/mod/mod.js"></script>':""}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${e?.render_component_path?`<script data-js-component type="module" src="/_joystick/${e?.render_component_path}"></script>`:""}
      ${e?.render_layout_path?`<script data-js-layout type="module" src="/_joystick/${e?.render_layout_path}"></script>`:""}
      ${h?'<script type="module" src="/_joystick/hmr/client.js"></script>':""}
		`)},F=(e={})=>e?.base_html.replace("${css}",`<style type="text/css">${e?.css}</style>`).replace("${subject}",p(e?.email_options?.subject||"")).replace("${preheader}",p(e?.email_options?.preheader||"")).replace('<div id="email"></div>',`<div id="email">${e?.html}</div>`),I=(e={})=>e?.is_email?F(e):D(e),R=async(e="")=>{const t=`${e?`base_${e}`:"base"}.html`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await u(`email/${t}`)?y(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},T=async(e="")=>{const t=`${e?`base_${e}`:"base"}.css`;return process._joystick_email_base_files?.[t]?process._joystick_email_base_files[t]:await u(`email/${t}`)?y(`email/${t}`,"utf-8"):(console.warn(`Could not find email/${t}`),"")},B=(e=null,t={})=>e(t),H=async(e={})=>{const t=B(e?.component_to_render,e?.component_options),r=x(e?.req,e?.res,e?.api_schema),f=[],_=await t.render_for_ssr(r,e?.req,f,{linkedom_document:C,is_email:e?.is_email,is_dynamic_page_render:e?.is_dynamic_page_render});if(e?.is_dynamic_page_render)return _?.data;const b=e?.is_email?await T(e?.email_options?.base_html_name):null,g=e?.is_email?await R(e?.email_options?.base_html_name):null;let s="",j="";const l=e?.mod?.in_use&&e?.mod?.components_in_use&&e?.mod?.components_in_use?.length>0;if(l){const w=e?.mod?.theme==="light"?"dark":"light",m={...e?.mod?.css?.globals};delete m[w],s+=Object.values(m||{})?.reduce((a="",d="")=>(a+=d,a),"");const n=Object.entries(e?.mod?.css?.components)?.filter(([a]="")=>e?.mod?.components_in_use?.includes(a));for(let a=0;a<n?.length;a+=1){const[d,v]=n[a];s+=v[e?.mod?.theme]}}const $=I({is_email:e?.is_email,attributes:e?.attributes,base_html:e?.is_email?g:e?.base_html,component_instance:t,css:e?.is_email?`
			${b}
			${_?.css}
		`:_?.css,mod_version:e?.mod?.version,mod_in_use:e?.mod?.in_use,mod_tree_shaking:l,mod_css:s,mod_js:j,mod_theme:e?.mod?.theme,data:_?.data,email_options:e?.email_options,head:e?.head,html:_?.html,props:{theme:e?.mod?.theme,...e?.component_options?.props||{}},render_component_path:e?.render_component_path,render_layout_path:e?.render_layout_path,req:e?.req,translations:e?.component_options?.translations,url:e?.component_options?.url}),k=E($,e?.head,e?.req);return J(k,e?.attributes)};var ee=H;export{ee as default};
