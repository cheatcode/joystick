import runGetter from "../app/runGetter.js";
var get_default = ({
  getterName = "",
  getterOptions = {},
  skip = false,
  input = null,
  output = null,
  context = {},
  APIOptions = {}
}) => {
  return new Promise((resolve, reject) => {
    if (skip) {
      return resolve();
    }
    runGetter({
      getterName,
      getterOptions,
      input,
      output,
      APIOptions,
      context
    }).then((response) => {
      return resolve(response);
    }).catch((response) => {
      return reject(JSON.stringify(response));
    });
  });
};
export {
  get_default as default
};
