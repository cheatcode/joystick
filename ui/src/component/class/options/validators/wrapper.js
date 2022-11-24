import throwFrameworkError from "../../../../lib/throwFrameworkError"
import { isArray, isObject, isString } from "../../../../lib/types";

export default (value = null) => {
  try {
    if (!isObject(value)) {
      throwFrameworkError(
        'component.optionValidators.wrapper',
        'options.wrapper must be an object.'
      );
    }

    for (const [methodKey, methodValue] of Object.entries(value)) {
      if (methodKey === 'id' && !isString(methodValue)) {
        throwFrameworkError(
          'component.optionValidators.wrapper',
          `options.wrapper.${methodKey} must be assigned a string.`
        );
      }

      if (methodKey === 'classList' && !isArray(methodValue)) {
        throwFrameworkError(
          'component.optionValidators.wrapper',
          `options.wrapper.${methodKey} must be assigned an array of strings.`
        );
      }
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.wrapper', exception);
  }
}