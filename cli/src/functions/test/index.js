import dev from "../../lib/dev/index.js";

export default async (args = {}, options = {}) => {
  await dev({
    environment: 'test',
    process,
    port: 1977,
    watch: options?.watch,
  });
};
