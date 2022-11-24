import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction, isString } from "../../../../lib/types";

export default (value = null) => {
  try {
    if (!isString(value) && !isFunction(value)) {
      throwFrameworkError(
        'component.optionValidators.css',
        "options.css must be a string or function returning a string."
      );
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.css', exception);
  }
}