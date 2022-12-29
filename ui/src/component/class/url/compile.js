import matchURL from "../../../lib/matchURL";
import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isString } from "../../../lib/types";

export default (url = {}) => {
  try {
    return {
      ...url,
      isActive: (path = '') => {
        if (isString(path) && url?.route !== '*') {
          return matchURL(path, url?.route);
        }

        return false;
      },
    };
  } catch (exception) {
    throwFrameworkError('component.url.compile', exception);
  }
}