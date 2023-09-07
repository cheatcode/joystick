import {EXAMPLE_CODE_REGEX} from "../regexes.js";

export default (code = '') => {
  let exampleIndex = 0;
  return code.replace(
    EXAMPLE_CODE_REGEX,
    () => {
      return `%example:${exampleIndex++}%`;
    }
  );
};
