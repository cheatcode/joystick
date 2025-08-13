import fetch from 'node-fetch';
import get_test_port from '../../lib/get_test_port.js';

const accounts_delete = (user_id = '') => {
  return fetch(`http://localhost:${get_test_port()}/api/_test/accounts`, {
    method: 'DELETE',
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id }),
    cache: 'no-store',
  });
};

export default accounts_delete;
