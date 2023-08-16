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
    throwFrameworkError('api.get.handleParseResponse', exception);
  }
};

export default (getterName = "", getterOptions = {}) => {
  try {
    if (typeof window.fetch !== 'undefined' && !getterOptions?.skip) {
      // NOTE: Wrap fetch() with another Promise so we can control routing of errors
      // received in the response (by default they don't go to catch() which is where
      // get() should return errors).
      return new Promise((resolve, reject) => {
        const input = getterOptions.input ? JSON.stringify(getterOptions.input) : null;
        const output = getterOptions.output ? JSON.stringify(getterOptions.output) : null;
        const url = `${window.location.origin}/api/_getters/${getterName}?input=${input}&output=${output}`;
        const csrf = document.querySelector('[name="csrf"]')?.getAttribute('content');
        
        return fetch(url, {
          method: 'GET',
          mode: "cors",
          headers: {
            ...(getterOptions?.headers || {}),
            'x-joystick-csrf': csrf,
          },
          credentials: "include",
        }).then(async (response) => {
          const dataFromResponse = await handleParseResponse(response);
  
          if (dataFromResponse?.errors) {
            logRequestErrors(`get request`, dataFromResponse.errors);
            return reject(dataFromResponse);
          }
      
          return resolve(dataFromResponse);
        }).catch((error) => {
          logRequestErrors(`get request`, [error]);
          return reject({ errors: [error] });
        });
      });
    }

    return Promise.resolve();
  } catch (exception) {
    throwFrameworkError(`get request`, exception);
  }
};
