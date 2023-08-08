import dev from "../../lib/dev/index.js";
var start_default = async (args = {}, options = {}) => {
  await dev({
    environment: args?.environment || "development",
    process,
    port: options?.port ? parseInt(options?.port) : 2600
  });
};
export {
  start_default as default
};
