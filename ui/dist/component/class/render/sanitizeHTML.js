var o=(r="",e={})=>{throw new Error(`[joystick${r?`.${r}`:""}] ${e.message||e.reason||e}`)};var t=new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g),c=new RegExp(/\n/g);var a=(r="")=>{try{return(r.match(t)||[]).forEach(n=>{r=r.replace(n,"")}),r}catch(e){o("component.render.sanitizeHTML.removeCommentedCode",e)}},p=(r="")=>{try{let e=`${r}`;return e=a(e),e}catch(e){o("component.render.sanitizeHTML",e)}};export{p as default};
