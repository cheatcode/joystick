var n=(t=[])=>{console.log({listeners:t});for(let e of t)e.element&&e.eventType&&e.eventListener&&e.element.removeEventListener(e.eventType,e.eventListener)};export{n as default};
