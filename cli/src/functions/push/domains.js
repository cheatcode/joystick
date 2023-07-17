const push = {
  local: ['http://localhost:2600'],
  staging: [],
  production: ['https://push.cheatcode.co'],
};

const provision = {
  local: ['http://localhost:2602'],
  staging: [],
  production: ['https://provision.cheatcode.co'],
};

const versions = {
  local: ['http://localhost:2603', 'http://localhost:2604', 'http://localhost:2605'],
  staging: [],
  production: ['https://push-versions-1.cheatcode.co', 'https://push-versions-2.cheatcode.co', 'https://push-versions-3.cheatcode.co'],
};

export default {
  push,
  provision,
  versions,
};