import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isString } from "../../../lib/types";

export default (url = {}) => {
  try {
    return {
      ...url,
      query: {
        ...(url?.query || {}),
        set: (parameterName = "", parameterValue = "") => {
          if (typeof window !== "undefined") {
            const url = new URL(window.location);
            url.searchParams.append(parameterName, parameterValue);
            window.history.pushState({}, "", url);
          }
        },
        unset: (parameterName = "") => {
          if (typeof window !== "undefined") {
            const url = new URL(window.location);
            url.searchParams.delete(parameterName);
            window.history.pushState({}, "", url);
          }
        },
      },
      isActive: (path = "") => {
        if (isString(path) && url?.route !== "*") {
          return (
            path ===
            (typeof location !== "undefined" ? location.pathname : url.path)
          );
        }

        return false;
      },
    };
  } catch (exception) {
    throwFrameworkError("component.url.compile", exception);
  }
};
