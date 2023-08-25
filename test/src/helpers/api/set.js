import logRequestErrors from "../../lib/logRequestErrors.js";
import parseJSON from "../../lib/parseJSON.js";
import throwFrameworkError from "../../lib/throwFrameworkError.js";
import generateCookieHeader from "../../lib/generateCookieHeader.js";

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

        const headers = {
          ...(setterOptions?.headers || {}),
          "Content-Type": "application/json",
          'x-joystick-csrf': 'joystick_test',
        };

        if (setterOptions?.user) {
          headers.Cookie = generateCookieHeader({
            joystickLoginToken: setterOptions?.user?.joystickLoginToken,
            joystickLoginTokenExpiresAt: setterOptions?.user?.joystickLoginTokenExpiresAt,
          }); 
        }

        return window.fetch(url, {
          method: 'POST',
          mode: "cors",
          headers,
          body,
          credentials: "include",
          cache: 'no-store',
        }).then(async (response) => {
          const dataFromResponse = await handleParseResponse(response);

          if (dataFromResponse?.errors) {
            logRequestErrors(`set`, dataFromResponse.errors);
            return reject(dataFromResponse);
          }

          return resolve(dataFromResponse);
        }).catch((error) => {
          logRequestErrors(`set`, [error]);
          return reject({ errors: [error] });
        });
      });
    }

    return Promise.resolve();
  } catch (exception) {
    throwFrameworkError(`set request`, exception);
  }
};