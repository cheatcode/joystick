import fetch from 'node-fetch';

export default (userToSignup = {}) => {
  return fetch(`http://localhost:${process.env.PORT}/api/_test/accounts/signup`, {
    method: 'POST',
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userToSignup),
    cache: 'no-store',
  }).then((response) => response.json()).catch((error) => {
    console.warn(error);
  });
};
