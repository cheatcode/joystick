export default (endpoint = "", endpointOptions = {}) => {
  if (fetch) {
    return new Promise((resolve, reject) => {
      const formattedEndpoint = {
        signup: "signup",
        login: "login",
        logout: "logout",
        recoverPassword: "recover-password",
        resetPassword: "reset-password",
      }[endpoint];

      return fetch(
        `${window.location.origin}/api/_accounts/${formattedEndpoint}`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...endpointOptions,
            origin: window?.location?.origin,
          }),
          credentials: "include",
        }
      )
        .then(async (response) => {
          const data = await response.json();

          if (data && data.errors) {
            console.log(
              `%c❌ accounts.${endpoint} request failed with the following errors:`,
              'background-color: #ffcc00; padding: 7px; font-family: "inherit"; font-size: 11px; line-height: 10px; color: #000;'
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
            'background-color: #ffcc00; padding: 7px; font-family: "inherit"; font-size: 11px; line-height: 10px; color: #000;'
          );
          console.log(error);
          reject(error);
          return error;
        });
    });
  }
};
