import parseJSON from "../lib/parseJSON";
import throwFrameworkError from "../lib/throwFrameworkError";
import logRequestErrors from "../lib/logRequestErrors";

const handleParseResponse = async (response = {}) => {
  try {
    // NOTE: Parse as text and then pass to parseJSON so Joystick can explicitly handle
    // invalid JSON errors.
    const responseAsText = await response.text();
    const dataFromResponse = parseJSON(responseAsText);
    return dataFromResponse;
  } catch (exception) {
    throwFrameworkError('accounts.request.handleParseResponse', exception);
  }
};

const getBody = (httpMethod = 'GET', endpointOptions = {}) => {
  try {
    const requestsWithBody = ['POST'];

    if (requestsWithBody.includes(httpMethod)) {
      return JSON.stringify({
        ...endpointOptions,
        origin: window?.location?.origin,
      });
    }

    return null;
  } catch (exception) {
    throwFrameworkError('accounts.request.getBody', exception);
  }
};

const getHTTPMethod = (endpoint = null) => {
  try {
    switch(endpoint) {
      case 'authenticated':
      case 'user':
        return 'GET';
      default:
        return 'POST';
    }
  } catch (exception) {
    throwFrameworkError('accounts.request.getHTTPMethod', exception);
  }
};

export default (endpoint = "", endpointOptions = {}) => {
  try {
    if (typeof window.fetch !== 'undefined') {
      // NOTE: Wrap fetch() with another Promise so we can control routing of errors
      // received in the response (by default they don't go to catch() which is where
      // accounts methods should return errors).
      return new Promise((resolve, reject) => {
        const url = `${window.location.origin}/api/_accounts/${endpoint}`;
        const httpMethod = getHTTPMethod(endpoint);
        const body = getBody(httpMethod, endpointOptions);
  
        return fetch(url, {
          method: httpMethod,
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body,
          credentials: "include",
        }).then(async (response) => {
          const dataFromResponse = await handleParseResponse(response);
  
          if (dataFromResponse?.errors) {
            logRequestErrors(`accounts.${endpoint}`, dataFromResponse.errors);
            return reject(dataFromResponse);
          }
      
          return resolve(dataFromResponse);
        }).catch((error) => {
          logRequestErrors(`accounts.${endpoint}`, [error]);
          return reject({ errors: [error] });
        });
      });
    }
  } catch (exception) {
    throwFrameworkError(`accounts.request.${endpoint}`, exception);
  }
};
