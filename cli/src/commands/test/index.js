import development_server from "../../lib/development_server/index.js";

const test = async (args = {}, options = {}) => {
  await development_server({
    environment: 'test',
    process,
    port: 1977,
    watch: options?.watch,
  });
};

export default test;
