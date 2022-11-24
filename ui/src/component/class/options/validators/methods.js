import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction, isObject } from "../../../../lib/types";

export default (value = null) => {
  try {
    if (!isObject(value)) {
      throwFrameworkError(
        'component.optionValidators.methods',
        "options.methods must be an object."
      );
    }

    for (const [methodKey, methodValue] of Object.entries(value)) {
      if (!isFunction(methodValue)) {
        throwFrameworkError(
          'component.optionValidators.methods',
          `options.methods.${methodKey} must be assigned a function.`
        );
      }
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.methods', exception);
  }
}