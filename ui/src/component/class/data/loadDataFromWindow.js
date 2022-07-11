import throwFrameworkError from "../../../lib/throwFrameworkError";
import windowIsUndefined from "../../../lib/windowIsUndefined";
import compileData from "./compile";

export default (componentInstance = {}) => {
  try {
    if (!windowIsUndefined() && window.__joystick_data__ && window.__joystick_data__[componentInstance?.ssrId]) {
      const dataFromWindow = window.__joystick_data__[componentInstance?.ssrId] || {};
      const requestFromWindow = window.__joystick_req__ || {};
      return compileData(dataFromWindow, requestFromWindow, componentInstance);
    }

    return {};
  } catch (exception) {
    throwFrameworkError('component.loadDataFromWindow', exception);
  }
};