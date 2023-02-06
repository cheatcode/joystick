const provision = {
  development: 'http://localhost:2603',
  staging: 'https://provision-test.cheatcode.co',
  production: 'https://provision.cheatcode.co',
}[process.env.NODE_ENV || 'development'];

const push = {
  development: 'http://localhost:2600',
  staging: 'https://push-test.cheatcode.co',
  production: 'https://push.cheatcode.co',
}[process.env.NODE_ENV || 'development'];

export default {
  provision,
  push
};