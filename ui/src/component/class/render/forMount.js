import throwFrameworkError from "../../../lib/throwFrameworkError";
import getUpdatedDOM from "./getUpdatedDOM";

export default (componentInstance = {}) => {
  try {
    const updatedDOM = getUpdatedDOM(componentInstance, { includeActual: true });
    componentInstance.dom = updatedDOM;
    return updatedDOM.actual;
  } catch (exception) {
    throwFrameworkError('component.render.forMount', exception);
  }
};