import { EXAMPLE_CODE_REGEX } from "../regexes.js";
var replaceExamples_default = (code = "") => {
  let exampleIndex = 0;
  return code.replace(
    EXAMPLE_CODE_REGEX,
    () => {
      return `%example:${exampleIndex++}%`;
    }
  );
};
export {
  replaceExamples_default as default
};
