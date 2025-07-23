import development_server from "../../lib/development_server/index.js";

const start = async (args = {}, options = {}) => {
  await development_server({
    environment: options?.environment || 'development',
    port: options?.port || 2600,
    debug: !!options?.debug,
    imports: options?.imports || [],
  });
};

export default start;
