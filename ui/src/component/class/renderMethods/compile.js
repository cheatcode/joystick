import throwFrameworkError from "../../../lib/throwFrameworkError";
import renderMethods from "./index";

export default (componentInstance = {}, options = {}) => {
  try {
    return Object.entries(renderMethods).reduce((methods, [key, value]) => {
      methods[key] = value.bind({
        ...componentInstance,
        ...options,
      });

      return methods;
    }, {});
  } catch (exception) {
    throwFrameworkError('component.renderMethods.compile', exception);
  }
};