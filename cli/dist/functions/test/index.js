import dev from "../../lib/dev/index.js";
var test_default = async (args = {}, options = {}) => {
  await dev({
    environment: "test",
    process,
    port: 1977,
    watch: options?.watch
  });
};
export {
  test_default as default
};
