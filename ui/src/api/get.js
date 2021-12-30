import logRequestErrors from "../utils/logRequestErrors";

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
            logRequestErrors('get request', data.errors);
            return reject(data);
          }

          resolve(data);

          return data;
        })
        .catch((error) => {
          logRequestErrors('get request', [error]);
          reject(error);
          return error;
        });
    });
  }
};
