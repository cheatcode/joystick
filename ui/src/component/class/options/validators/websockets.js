import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction, isString } from "../../../../lib/types";

export default (value = null) => {
  try {
    if (!isFunction(value)) {
      throwFrameworkError(
        'component.optionValidators.websockets',
        "options.websockets must be a function returning an object."
      );
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.websockets', exception);
  }
}