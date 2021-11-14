export default (getterName = "", getterOptions = {}) => {
  if (fetch) {
    return new Promise((resolve, reject) => {
      const input = getterOptions.input ? JSON.stringify(getterOptions.input) : null;
      const output = getterOptions.output ? JSON.stringify(getterOptions.output) : null;

      const options = {
        method: "GET",
        mode: "cors",
        credentials: "include",
      };

      if (getterOptions?.headers) {
        options.headers = getterOptions?.headers;
      }

      fetch(
        `${window.location.origin}/api/_getters/${getterName}?input=${input}&output=${output}`,
        options
      )
        .then(async (response) => {
          const data = await response.json();

          if (data && data.errors) {
            console.log(
              "%c❌ get request failed with the following errors:",
              'background-color: #ffcc00; padding: 7px; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-size: 13px; line-height: 13px; color: #000;'
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
            "%c❌ get request failed with the following network error:",
            'background-color: #ffcc00; padding: 7px; font-family: "inherit"; font-size: 11px; line-height: 10px; color: #000;'
          );
          console.log(error);
          reject(error);
          return error;
        });
    });
  }
};
