import URLPattern from "url-pattern";
import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isString } from "../../../lib/types";

export default (url = {}) => {
  try {
    return {
      ...url,
      isActive: (path = '') => {
        if (!isString(path)) {
          return false;
        }

        if (url?.route !== '*') {
          const pattern = new URLPattern(url?.route || '');
          return (url?.path && url.path === path) || !!pattern?.match(path);
        }

        return false;
      },
    };
  } catch (exception) {
    throwFrameworkError('component.url.compile', exception);
  }
}