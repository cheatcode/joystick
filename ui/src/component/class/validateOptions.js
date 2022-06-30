import throwFrameworkError from "../utils/throwFrameworkError";
import hasAllRequiredOptions from "./hasAllRequiredOptions";
import allowedComponentOptions from './allowedComponentOptions';
import optionValidators from "./optionValidators";
import { isFunction } from "../../lib/types";

export default (options = {}) => {
  try {
    if (!hasAllRequiredOptions(options)) {
      throwFrameworkError(
        'component.validateOptions',
        `component options must include ${required.options.join(",")}.`
      );
    }
  
    for (const [optionKey, optionValue] of Object.entries(options)) {
      if (!allowedComponentOptions.includes(optionKey)) {
        throwFrameworkError(
          'component.validateOptions',
          `${optionKey} is not supported by joystick.component.`
        );
      }
  
      const optionValueValidator = optionValidators[optionKey];
  
      if (optionValueValidator && isFunction(optionValueValidator)) {
        optionValueValidator(optionValue);
      }
    }
  } catch (exception) {
    throwFrameworkError('component.validateOptions', exception);
  }
};
