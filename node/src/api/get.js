import runGetter from "../app/runGetter.js";

export default ({
  getterName = "",
  getterOptions = {},
  input = null,
  output = null,
  context = {},
  APIOptions = {},
}) => {
  return new Promise((resolve, reject) => {
    if (!getterOptions?.skip) {
      runGetter({
        getterName,
        getterOptions,
        input,
        output,
        APIOptions,
        context,
      }).then((response) => {
        return resolve(response);
      }).catch((response) => {
        return reject(JSON.stringify(response));
      });
    }
  });
};
