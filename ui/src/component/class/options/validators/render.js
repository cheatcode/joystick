import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction } from "../../../../lib/types";

export default (value = null) => {
  try {
    if (!isFunction(value)) {
      throwFrameworkError(
        'component.optionValidators.render',
        "options.render must be a function returning a string."
      );
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.render', exception);
  }
}