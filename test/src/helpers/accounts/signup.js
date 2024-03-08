import fetch from 'node-fetch';

const accounts_signup = (user_to_signup = {}) => {
  return fetch(`http://localhost:${process.env.PORT}/api/_test/accounts/signup`, {
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
