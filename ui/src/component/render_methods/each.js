import types from "../../lib/types.js";

const each = function each(items = [], callback = null) {
  if (!types.is_function(callback)) {
    return '';
  }

  if (items && types.is_array(items)) {
    return items
      .map((item, itemIndex) => {
        return callback(item, itemIndex);
      })
      .join("");
  }

  return '';
};

export default each;
