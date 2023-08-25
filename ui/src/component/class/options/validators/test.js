import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isObject, isString } from "../../../../lib/types";

export default (value = null) => {
  try {
    if (!isObject(value)) {
      throwFrameworkError(
        'component.optionValidators.test',
        "options.test must be an object."
      );
    }

    if (value?.name && !isString(value.name)) {
      throwFrameworkError(
        'component.optionValidators.test',
        `options.test.name must be assigned a string.`
      );
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.test', exception);
  }
}