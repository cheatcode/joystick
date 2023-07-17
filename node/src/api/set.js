import runSetter from "../app/runSetter.js";

export default ({
  setterName = "",
  setterOptions = {},
  input = null,
  output = null,
  context = {},
  APIOptions = {},
}) => {
  return new Promise((resolve, reject) => {
    if (!setterOptions?.skip) {
      runSetter({
        setterName,
        setterOptions,
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
