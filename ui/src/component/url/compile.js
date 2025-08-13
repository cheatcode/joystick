import types from "../../lib/types.js";

const is_active = (path = "", url = {}) => {  
  if (types.is_string(path) && url?.route !== "*") {
    return (
      path ===
      (typeof location !== "undefined" ? location.pathname : url.path)
    );
  }

  return false;
};

const compile = (url = {}) => {
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
    is_active: (path = '') => is_active(path, url),
    isActive: (path = '') => is_active(path, url),
  };
};

export default compile;
