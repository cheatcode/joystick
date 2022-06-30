import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isFunction, isObject } from "../../../lib/types";
import allowedLifecycleMethods from "../allowedLifecycleMethods";

export default (value = null) => {
  try {
    if (!isObject(value)) {
      throwFrameworkError(
        'component.optionValidators.lifecycle',
        "options.lifecycle must be an object."
      );
    }

    for (const [lifecycleKey, lifecycleValue] of Object.entries(value)) {
      if (!allowedLifecycleMethods.includes(lifecycleKey)) {
        throwFrameworkError(
          'component.optionValidators.lifecycle',
          `options.lifecycle.${lifecycleKey} is not supported.`
        );
      }

      if (!isFunction(lifecycleValue)) {
        throwFrameworkError(
          'component.optionValidators.lifecycle',
          `options.lifecycle.${lifecycleKey} must be assigned a function.`
        );
      }
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.lifecycle', exception);
  }
}