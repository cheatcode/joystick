import throwFrameworkError from "../../../lib/throwFrameworkError";
import windowIsUndefined from "../../../lib/windowIsUndefined";
import compileData from "./compile";

export default (componentInstance = {}) => {
  try {
    if (!windowIsUndefined()) {
      const dataFromWindow = (window.__joystick_data__ && window.__joystick_data__[componentInstance?.id]) || {};
      const requestFromWindow = window.__joystick_req__ || {};
      return compileData(dataFromWindow, requestFromWindow, componentInstance);
    }

    return componentInstance?.data || {};
  } catch (exception) {
    throwFrameworkError('component.loadDataFromWindow', exception);
  }
};