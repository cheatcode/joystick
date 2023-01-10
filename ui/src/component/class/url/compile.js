import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isString } from "../../../lib/types";

export default (url = {}) => {
  try {
    return {
      ...url,
      isActive: (path = '') => {
        if (isString(path) && url?.route !== '*') {
          return path === (typeof location !== 'undefined' ? location.pathname : url.path);
        }

        return false;
      },
    };
  } catch (exception) {
    throwFrameworkError('component.url.compile', exception);
  }
}