import"chalk";import k from"fs";import r from"../../get_platform_safe_path.js";import c from"../../constants.js";import j from"./set_component_id.js";import x from"../../path_exists.js";const{readFile:f,writeFile:E}=k.promises,g=(t="",o=[])=>{for(let n=0;n<o?.length;n+=1){const _=o[n];t=t.replace(`%example:${n}%`,_)}},$=(t="",o="",n="")=>t.replace(`${o};`,`if (
      typeof window !== 'undefined' &&
      window.__joystick_should_auto_mount__ === true &&
      !window.__joystick_layout_url__ &&
      window.__joystick_page_url__ &&
      !window.__joystick_hmr_update__ &&
      joystick &&
      joystick.mount
    ) {
      joystick.mount(${n}, window.__joystick_ssr_props__ || {}, document.getElementById('app'));
    }

    export default ${n};
    `),O=(t="",o="",n="")=>t.replace(`${o};`,`if (
	    typeof window !== 'undefined' &&
	    window.__joystick_should_auto_mount__ === true &&
	    window.__joystick_layout_url__ &&
      window.__joystick_page_url__ &&
      !window.__joystick_hmr_update__ &&
	    joystick &&
	    joystick.mount
	  ) {
	    (async () => {
	      const layout_component_file = await import(window.__joystick_layout_url__);
	      const page_component_file = await import(window.window.__joystick_page_url__);
	      const layout = layout_component_file.default;
	      const page = page_component_file.default;
	      joystick.mount(layout, Object.assign({ ...window.__joystick_ssr_props__ }, { page }), document.getElementById('app'));
	    })();
	  }

	export default ${n};
	  `),X=(t="")=>t.replace(c.JOYSTICK_COMMENT_REGEX,""),y=(t="")=>{let o=0;return t.replace(c.EXAMPLE_CODE_REGEX,()=>`%example:${o++}%`)},w=(t="")=>t.match(c.EXAMPLE_CODE_REGEX)||[],P=(t=null)=>(t&&t.split(" ")||[])?.pop(),R=(t=!1,o=null)=>t&&!!o,C=(t="")=>{const o=t.match(c.EXPORT_DEFAULT_REGEX)||[];return o&&o[0]},h=(t="")=>{const o=t.match(c.JOYSTICK_UI_REGEX)||[];return!!o&&!!o[0]},u=(t="",o={})=>[r(t)].some(n=>o.path.includes(n)),G=(t="")=>[r("ui/"),r("email/")].some(o=>t.includes(o)),I=(t={})=>{t.onLoad({filter:/\.js$/},async(o={})=>{try{const n=u("ui/layouts",o),_=u("ui/pages",o),p=u("email/",o);if(n||_||p){let e=await f(r(o.path),"utf-8");const l=h(e),i=C(e),s=R(l,i),m=w(e),a=P(i);return e=y(e),e=X(e),e=a&&n?O(e,i,a):e,e=a&&_?$(e,i,a):e,g(e,m),{contents:e,loader:"js"}}}catch(n){console.warn(n)}}),t.onEnd(()=>new Promise(async o=>{try{for(let n=0;n<t?.initialOptions?.entryPoints?.length;n+=1){const _=t?.initialOptions?.entryPoints[n],p=G(_),d=await x(`${t?.initialOptions?.outdir}/${_}`);if(p&&d){let e=await f(`${t?.initialOptions?.outdir}/${_}`,"utf-8");const l=h(e),i=w(e);if(e=y(e),l){e=await j(e);for(let s=0;s<i?.length;s+=1){const m=i[s];e=e.replace(`%example:${s}%`,m)}await E(`${t?.initialOptions?.outdir}/${_}`,e)}}}o()}catch(n){console.warn(n)}}))};var B=I;export{B as default};
