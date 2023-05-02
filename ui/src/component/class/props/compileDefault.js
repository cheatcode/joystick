import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isArray, isFunction, isObject } from "../../../lib/types";

const compile = (componentInstance = {}, defaultProps = null) => {
  try {
    const compiledDefaultProps = defaultProps(componentInstance);

    if (compiledDefaultProps && isObject(compiledDefaultProps) && !isArray(compiledDefaultProps)) {
      return Object.assign({}, compiledDefaultProps);
    }

    return {};
  } catch (exception) {
    throwFrameworkError('component.props.compileDefaultProps.compile', exception);
  }
};

export default (componentInstance = {}, defaultProps = {}) => {
  try {
    if (isFunction(defaultProps)) {
      return compile(componentInstance, defaultProps);
    }

    return Object.assign({}, defaultProps);
  } catch (exception) {
    throwFrameworkError('component.props.compileDefaultProps', exception);
  }
}