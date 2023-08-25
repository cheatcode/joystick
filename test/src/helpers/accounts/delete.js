import fetch from 'node-fetch';

export default (userId = '') => {
  return fetch(`http://localhost:${process.env.PORT}/api/_test/accounts`, {
    method: 'DELETE',
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
    cache: 'no-store',
  });
};
