import runSetter from "../app/runSetter.js";

export default ({
  setterName = "",
  setterOptions = {},
  skip = false,
  input = null,
  output = null,
  context = {},
  APIOptions = {},
}) => {
  return new Promise((resolve, reject) => {
    if (skip) {
      return resolve();
    }

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
  });
};
