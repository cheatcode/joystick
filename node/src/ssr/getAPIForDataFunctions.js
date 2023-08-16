import get from "../api/get";
import set from "../api/set";

export default (req = {}, api = {}) => {
  try {
    // NOTE: We have to relay the original SSR req object because if/when these get
    // and set functions are called on the server, they have no awareness of the original
    // inbound request (it's technically a brand new request). Passing the cookie here
    // ensures that the user making the request is "forwarded" along with those requests.
    return {
      get: (getterName = "", getterOptions = {}) => {
        return get({
          getterName,
          getterOptions: api?.getters[getterName] || {},
          input: getterOptions?.input,
          output: getterOptions?.output,
          context: req?.context,
          APIOptions: api?.options,
        });
        },
      set: (setterName = "", setterOptions = {}) => {
        return set({
          setterName,
          setterOptions: api?.setters[setterName] || {},
          input: setterOptions?.input,
          output: setterOptions?.output,
          context: req?.context,
          APIOptions: api?.options,
        });
        },
    };
  } catch (exception) {
    throw new Error(`[ssr.getAPIForDataFunctions] ${exception.message}`);
  }
};