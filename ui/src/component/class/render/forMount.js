import throwFrameworkError from "../../../lib/throwFrameworkError";
import getUpdatedDOM from "./getUpdatedDOM";

export default (componentInstance = {}, options = {}) => {
  try {
    const updatedDOM = getUpdatedDOM(componentInstance, { includeActual: true, existingChildren: options?.existingChildren });
    componentInstance.dom = updatedDOM;
    return updatedDOM.actual;
  } catch (exception) {
    throwFrameworkError('component.render.forMount', exception);
  }
};