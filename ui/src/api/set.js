import logRequestErrors from "../lib/logRequestErrors";
import parseJSON from "../lib/parseJSON";
import throwFrameworkError from "../lib/throwFrameworkError";

const handleParseResponse = async (response = {}) => {
  try {
    // NOTE: Parse as text and then pass to parseJSON so Joystick can explicitly handle
    // invalid JSON errors.
    const responseAsText = await response.text();
    const dataFromResponse = parseJSON(responseAsText);
    return dataFromResponse;
  } catch (exception) {
    throwFrameworkError('api.set.handleParseResponse', exception);
  }
};

const getBody = (setterOptions = {}) => {
  try {
    return JSON.stringify(setterOptions);
  } catch (exception) {
    throwFrameworkError('api.set.getBody', exception);
  }
};

export default (setterName = "", setterOptions = {}) => {
  try {
    if (typeof window.fetch !== 'undefined') {
      // NOTE: Wrap fetch() with another Promise so we can control routing of errors
      // received in the response (by default they don't go to catch() which is where
      // set() should return errors).
      return new Promise((resolve, reject) => {
        const url = `${window.location.origin}/api/_setters/${setterName}`;
        const body = getBody(setterOptions);
        const csrf = document.querySelector('[name="csrf"]')?.getAttribute('content');

        return fetch(url, {
          method: 'POST',
          mode: "cors",
          headers: {
            ...(setterOptions?.headers || {}),
            "Content-Type": "application/json",
            'x-joystick-csrf': csrf,
          },
          body,
          credentials: "include",
        }).then(async (response) => {
          const dataFromResponse = await handleParseResponse(response);
  
          if (dataFromResponse?.errors) {
            logRequestErrors(`set request`, dataFromResponse.errors);
            return reject(dataFromResponse);
          }
      
          return resolve(dataFromResponse);
        }).catch((error) => {
          logRequestErrors(`set request`, [error]);
          return reject({ errors: [error] });
        });
      });
    }

    return Promise.resolve();
  } catch (exception) {
    throwFrameworkError(`set request`, exception);
  }
};