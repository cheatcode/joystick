import throwFrameworkError from "./lib/throwFrameworkError";
import { isFunction } from "./lib/types";

const overrideSetInterval = (interval = null) => {
  try {
    window.setInterval = (callback = null, milliseconds = null) => {
      if (callback && milliseconds >= 0) {
        const intervalId = isFunction(interval) && interval(callback, milliseconds);
        window.joystick._internal.timers.push({ type: "interval", id: intervalId });
        return intervalId;
      }
    };

    window.setInterval._tainted = true;
  } catch (exception) {
    throwFrameworkError('overrideTimers.overrideSetInterval', exception);
  }
};

const overrideSetTimeout = (timeout = null) => {
  try {
    window.setTimeout = (callback = null, milliseconds = null) => {
      if (callback && milliseconds >= 0) {
        const timeoutId = isFunction(timeout) && timeout(callback, milliseconds);
        window.joystick._internal.timers.push({ type: "timeout", id: timeoutId });
        return timeoutId;
      }
    };

    window.setTimeout._tainted = true;
  } catch (exception) {
    throwFrameworkError('overrideTimers.overrideSetTimeout', exception);
  }
};

export default () => {
  try {
    if (typeof window !== "undefined") {
      if (!window.setTimeout._tainted) {
        overrideSetTimeout(window.setTimeout);
      }
  
      if (!window.setInterval._tainted) {
        overrideSetInterval(window.setInterval);
      }
    }
  } catch (exception) {
    throwFrameworkError('overrideTimers', exception);
  }
};