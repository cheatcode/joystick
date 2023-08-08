import dev from "../../lib/dev/index.js";

export default async (args = {}, options = {}) => {
  await dev({
    environment: args?.environment || 'development',
    process,
    port: options?.port ? parseInt(options?.port) : 2600,
  });
};
