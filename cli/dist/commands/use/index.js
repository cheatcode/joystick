import c from"child_process";import o from"util";import n from"../../lib/loader.js";import e from"../../lib/replace_in_files.js";const s=o.promisify(c.exec),t=async(a={},r={})=>{const i=new n;a?.release==="canary"&&(await e(process.cwd(),{match:[/\.js$/],exclude:[/node_modules/],replace_regex:/(@joystick\.js\/node)(?!-)/g,replace_with:"@joystick.js/node-canary"}),await e(process.cwd(),{match:[/\.js$/],exclude:[/node_modules/],replace_regex:/(@joystick\.js\/ui)(?!-)/g,replace_with:"@joystick.js/ui-canary"}),i.print("Swapping production packages for canary versions..."),await s("npm uninstall @joystick.js/node && npm i @joystick.js/node-canary"),await s("npm uninstall @joystick.js/ui && npm i @joystick.js/ui-canary")),a?.release==="production"&&(await e(process.cwd(),{match:[/\.js$/],exclude:[/node_modules/],replace_regex:/(@joystick\.js\/node-canary)/g,replace_with:"@joystick.js/node"}),await e(process.cwd(),{match:[/\.js$/],exclude:[/node_modules/],replace_regex:/(@joystick.js\/ui-canary)/g,replace_with:"@joystick.js/ui"}),i.print("Swapping canary packages for production versions..."),await s("npm uninstall @joystick.js/node-canary && npm i @joystick.js/node"),await s("npm uninstall @joystick.js/ui-canary && npm i @joystick.js/ui"))};var y=t;export{y as default};
