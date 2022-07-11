import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isFunction, isString } from "../../../lib/types";

export default (css = {}, componentInstance = {}) => {
  try {
    if (css && isString(css)) {
      return css;
    }

    if (css && isFunction(css)) {
      return css(componentInstance);
    }

    return '';
  } catch (exception) {
    throwFrameworkError('component.css.compile', exception);;
  }
};