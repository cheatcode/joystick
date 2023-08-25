import logRequestErrors from "../../lib/logRequestErrors.js";
import parseJSON from "../../lib/parseJSON.js";
import throwFrameworkError from "../../lib/throwFrameworkError.js";
import generateCookieHeader from "../../lib/generateCookieHeader.js";

const handleParseResponse = async (response = {}) => {
  try {
    // NOTE: Parse as text and then pass to parseJSON so Joystick can explicitly handle
    // invalid JSON errors.
    const responseAsText = await response.text();
    return parseJSON(responseAsText);
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

        const headers = {
          ...(getterOptions?.headers || {}),
          'x-joystick-csrf': 'joystick_test',
        };

        if (getterOptions?.user) {
          headers.Cookie = generateCookieHeader({
            joystickLoginToken: getterOptions?.user?.joystickLoginToken,
            joystickLoginTokenExpiresAt: getterOptions?.user?.joystickLoginTokenExpiresAt,
          }); 
        }

        return window.fetch(url, {
          method: 'GET',
          mode: "cors",
          headers,
          credentials: "include",
          cache: 'no-store',
        }).then(async (response) => {
          const dataFromResponse = await handleParseResponse(response);

          if (dataFromResponse?.errors) {
            logRequestErrors(`get`, dataFromResponse.errors);
            return reject(dataFromResponse);
          }

          return resolve(dataFromResponse);
        }).catch((error) => {
          logRequestErrors(`get`, [error]);
          return reject({ errors: [error] });
        });
      });
    }

    return Promise.resolve();
  } catch (exception) {
    throwFrameworkError(`get`, exception);
  }
};
