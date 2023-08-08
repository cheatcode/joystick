import availableQueryParameters from "./availableQueryParameters.js";
var buildQueryParameters_default = (connection = {}) => {
  const queryParameters = {};
  for (let i = 0; i < availableQueryParameters.length; i += 1) {
    const availableParameter = availableQueryParameters[i];
    if (connection && connection[availableParameter]) {
      queryParameters[availableParameter] = connection[availableParameter];
    }
  }
  return queryParameters;
};
export {
  buildQueryParameters_default as default
};
