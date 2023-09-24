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
    const sanitized_setter_options = { ...setterOptions };

    if (sanitized_setter_options?.loader) {
      delete sanitized_setter_options.loader;
    }

    return JSON.stringify(sanitized_setter_options);
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

        const headers = {
          ...(setterOptions?.headers || {}),
          "Content-Type": "application/json",
          'x-joystick-csrf': csrf,
        };

        if (window?.__joystick_test__) {
          headers.Cookie = generateCookieHeader({
            joystickLoginToken: window?.__joystick_test_login_token__,
            joystickLoginTokenExpiresAt: window.__joystick_test_login_token_expirs_at__,
          });
        }

        if (setterOptions?.loader?.instance) {
          setterOptions?.loader?.instance?.setState({ [setterOptions?.loader?.state || `${setterName}_loading`]: true });
        }

        return fetch(url, {
          method: 'POST',
          mode: "cors",
          headers,
          body,
          credentials: "include",
        }).then(async (response) => {
          const dataFromResponse = await handleParseResponse(response);
  
          if (setterOptions?.loader?.instance) {
            setterOptions?.loader?.instance?.setState({ [setterOptions?.loader?.state || `${setterName}_loading`]: false });
          }

          if (dataFromResponse?.errors) {
            logRequestErrors(`set request`, dataFromResponse.errors);
            return reject(dataFromResponse);
          }

          return resolve(dataFromResponse);
        }).catch((error) => {
          logRequestErrors(`set request`, [error]);

          if (setterOptions?.loader?.instance) {
            setterOptions?.loader?.instance?.setState({ [setterOptions?.loader?.state || `${setterName}_loading`]: false });
          }

          return reject({ errors: [error] });
        });
      });
    }

    return Promise.resolve();
  } catch (exception) {
    throwFrameworkError(`set request`, exception);
  }
};