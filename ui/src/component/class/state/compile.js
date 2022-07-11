import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isArray, isFunction, isObject } from "../../../lib/types";

const compileState = (componentInstance = {}, state = null) => {
  try {
    const compiledState = state(componentInstance);

    if (compiledState && isObject(compiledState) && !isArray(compiledState)) {
      return Object.assign({}, compiledState);
    }

    return {};
  } catch (exception) {
    throwFrameworkError('component.state.compile.compileState', exception);
  }
};

export default (componentInstance = {}, state = {}) => {
  try {
    if (isFunction(state)) {
      return compileState(componentInstance, state);
    }

    return Object.assign({}, state);
  } catch (exception) {
    throwFrameworkError('component.state.compile', exception);
  }
}