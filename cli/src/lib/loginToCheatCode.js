import fetch from 'node-fetch';
import domains from './domains.js';

export default (emailAddress = '', password = '') => {
  return fetch(`${domains.deploy}/api/cli/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      emailAddress,
      password,
    })
  }).then(async (response) => {
    // NOTE: We anticipate this to be a string containing a temporary login token
    // that will be written to disk to fulfill a deployment request and then burned
    // after use.
    return response.text();
  });
};