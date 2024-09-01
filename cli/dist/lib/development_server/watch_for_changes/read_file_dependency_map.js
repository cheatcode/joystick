import t from"fs";import i from"../../path_exists.js";const{readFile:s}=t.promises,o=async()=>{const e=".joystick/build/file_map.json";if(await i(e)){const a=await s(e,"utf-8");return a?JSON.parse(a):{}}return{}};var n=o;export{n as default};
//# sourceMappingURL=read_file_dependency_map.js.map
