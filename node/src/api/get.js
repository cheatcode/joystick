import fetch from "node-fetch";
import { URL, URLSearchParams } from "url";
import getOrigin from "./getOrigin";

export default (getterName = "", getterOptions = {}) => {
  if (fetch && !getterOptions?.skip) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${getOrigin()}/api/_getters/${getterName}`);
      const input = getterOptions.input
        ? JSON.stringify(getterOptions.input)
        : null;
      const output = getterOptions.output
        ? JSON.stringify(getterOptions.output)
        : null;

      const params = new URLSearchParams({
        input,
        output,
      });

      url.search = params.toString();

      const options = {
        method: "GET",
        mode: "cors",
        credentials: "include",
      };

      if (getterOptions?.headers) {
        options.headers = getterOptions?.headers;
      }

      fetch(url, options)
        .then(async (response) => {
          const data = await response.json();

          if (data && data.errors) {
            console.log(
              "%c❌ get request failed with the following errors:",
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
