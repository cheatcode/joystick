export default function (wallaby) {
  return {
    autoDetect: true,
    env: {
      type: 'node',
      params: {
        runner: '--experimental-vm-modules --no-warnings'
      }
    },
    files: [
      'src/**/*.js',
      '!src/**/*.test.js',
    ],
    tests: [
      'src/**/*.test.js'
    ],
    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },
  };
};