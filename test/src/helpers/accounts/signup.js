import fetch from 'node-fetch';
import get_test_port from '../../lib/get_test_port.js';

const accounts_signup = (user_to_signup = {}) => {
  return fetch(`http://localhost:${get_test_port()}/api/_test/accounts/signup`, {
    method: 'POST',
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user_to_signup),
    cache: 'no-store',
  }).then((response) => {
    return response.json();
  })
  .catch((error) => {
    console.warn(error);
  });
};

export default accounts_signup;
