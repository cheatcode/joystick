import logRequestErrors from "../utils/logRequestErrors";

export default (setterName = "", setterOptions = {}) => {
  if (fetch) {
    return new Promise((resolve, reject) => {
      return fetch(`${window.location.origin}/api/_setters/${setterName}`, {
        method: "POST",
        mode: "cors",
        headers: {
          ...(setterOptions?.headers || {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setterOptions),
        credentials: "include",
      })
        .then(async (response) => {
          const data = await response.json();

          if (data && data.errors) {
            logRequestErrors('set request', data.errors);
            return reject(data);
          }

          resolve(data);

          return data;
        })
        .catch((error) => {
          logRequestErrors('set request', [error]);
          reject(error);
          return error;
        });
    });
  }
};
