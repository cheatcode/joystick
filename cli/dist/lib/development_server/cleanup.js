import o from"./kill_process_ids.js";process.title="joystick_cleanup",process.on("message",async s=>{const e=JSON.parse(s)?.process_ids;o(e),process.exit()});
//# sourceMappingURL=cleanup.js.map
