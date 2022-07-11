import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isFunction } from "../../../lib/types";

const each = function each(items = [], callback = null) {
  try {
    if (!isFunction(callback)) {
      return '';
    }

    if (items && Array.isArray(items)) {
      return items
        .map((item, itemIndex) => {
          return callback(item, itemIndex);
        })
        .join("");
    }
  
    return '';
  } catch (exception) {
    throwFrameworkError('component.renderMethods.each', exception);
  }
};

export default each;
