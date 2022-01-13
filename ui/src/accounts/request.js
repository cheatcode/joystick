const getHTTPMethod = (endpoint = null) => {
  return {
    authenticated: 'GET',
    user: 'GET',
  }[endpoint] || 'POST';
};

const getFormattedEndpoint = (endpoint = '') => {
  return {
    authenticated: "authenticated",
    user: "user",
    signup: "signup",
    login: "login",
    logout: "logout",
    recoverPassword: "recover-password",
    resetPassword: "reset-password",
  }[endpoint];
};

export default (endpoint = "", endpointOptions = {}) => {
  if (fetch) {
    return new Promise((resolve, reject) => {
      const httpMethod = getHTTPMethod(endpoint);
      const formattedEndpoint = getFormattedEndpoint(endpoint);

      return fetch(
        `${window.location.origin}/api/_accounts/${formattedEndpoint}`,
        {
          method: httpMethod,
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: httpMethod === 'POST' ? JSON.stringify({
            ...endpointOptions,
            origin: window?.location?.origin,
          }) : null,
          credentials: "include",
        }
      )
        .then(async (response) => {
          const data = await response.json();

          if (data && data.errors) {
            console.log(
              `%c❌ accounts.${endpoint} request failed with the following errors:`,
              'background-color: #ffcc00; padding: 7px; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-size: 11px; line-height: 10px; color: #000;'
            );

            data.errors.forEach((error) => {
              console.log(error.message);

              if (error.stack) {
                console.log(error.stack);
              }
            });

            return reject(data);
          }

          resolve(data);

          return data;
        })
        .catch((error) => {
          console.log(
            `%c❌ accounts.${endpoint} request failed with the following network error:`,
            'background-color: #ffcc00; padding: 7px; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-size: 15px; line-height: 15px; color: #000;'
          );
          console.log(error);
          reject(error);
          return error;
        });
    });
  }
};
