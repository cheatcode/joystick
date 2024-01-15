import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isArray, isFunction, isObject } from "../../../lib/types";

const compileValues = (componentInstance = {}, values = null) => {
  try {
    const compiledValues = values(componentInstance);

    if (compiledValues && isObject(compiledValues) && !isArray(compiledValues)) {
      return Object.assign({}, compiledValues);
    }

    return {};
  } catch (exception) {
    throwFrameworkError('component.values.compile.compileValues', exception);
  }
};

export default (componentInstance = {}, values = {}) => {
  try {
    if (isFunction(values)) {
      return compileValues(componentInstance, values);
    }

    return Object.assign({}, values);
  } catch (exception) {
    throwFrameworkError('component.values.compile', exception);
  }
}