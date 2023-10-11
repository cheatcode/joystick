import get from "../api/get";
import set from "../api/set";
var getAPIForDataFunctions_default = (req = {}, api = {}) => {
  try {
    return {
      get: (getterName = "", getterOptions = {}) => {
        return get({
          getterName,
          getterOptions: api?.getters[getterName] || {},
          skip: getterOptions?.skip,
          input: getterOptions?.input,
          output: getterOptions?.output,
          context: req?.context,
          APIOptions: api?.options
        });
      },
      set: (setterName = "", setterOptions = {}) => {
        return set({
          setterName,
          setterOptions: api?.setters[setterName] || {},
          skip: setterOptions?.skip,
          input: setterOptions?.input,
          output: setterOptions?.output,
          context: req?.context,
          APIOptions: api?.options
        });
      }
    };
  } catch (exception) {
    throw new Error(`[ssr.getAPIForDataFunctions] ${exception.message}`);
  }
};
export {
  getAPIForDataFunctions_default as default
};
