const s=(t="",n=[])=>{typeof process<"u"&&process.env.NODE_ENV==="test"&&(process.test={...process.test||{},function_calls:{...process?.test?.function_calls||{},[t]:[...process?.test?.function_calls&&process?.test?.function_calls[t]||[],{called_at:new Date().toISOString(),args:n}]}}),typeof window<"u"&&window.__joystick_test__&&(window.test={...window.test||{},function_calls:{...window?.test?.function_calls||{},[t]:[...window?.test?.function_calls&&window?.test?.function_calls[t]||[],{called_at:new Date().toISOString(),args:n}]}})};var e=s;export{e as default};
