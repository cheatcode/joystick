import fetch from 'node-fetch';

const accounts_delete = (user_id = '') => {
  return fetch(`http://localhost:${process.env.PORT}/api/_test/accounts`, {
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
