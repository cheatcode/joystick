import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction, isObject, isString } from "../../../../lib/types";

export default (value = null) => {
  try {
    if (!isString(value) && !isFunction(value) && !isObject(value)) {
      throwFrameworkError(
        "component.optionValidators.css",
        "options.css must be a string, function returning a string, or an object returning breakpoints."
      );
    }
  } catch (exception) {
    throwFrameworkError("component.optionValidators.css", exception);
  }
};
