import types from "../../lib/types.js";

const validate_type = (type, value) => {
  switch (type) {
    case "any":
      return types.is_any(value);
    case "array":
      return types.is_array(value);
    case "boolean":
      return types.is_boolean(value);
    case "float":
      return types.is_float(value);
    case "integer":
      return types.is_integer(value);
    case "number":
      return types.is_number(value);
    case "object":
      return types.is_object(value);
    case "string":
      return types.is_string(value);
  }
};

export default validate_type;
