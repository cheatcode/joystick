var tests_config_default = {
  files: [`tests/**/*.test.js`],
  // NOTE: Intentionally limit to 1 test at a time to avoid concurrency creating
  // race conditions in tests that have users or other "global" data that needs
  // to be cleaned up. The extra time needed is worth it to guarantee that tests
  // don't step on each other's toes and our code is properly verified.
  concurrency: 1,
  cache: false
};
export {
  tests_config_default as default
};
