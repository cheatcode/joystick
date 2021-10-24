const validate_inputs = (inputs = {}, schema = {}, key_path = [], callback) => {
  return Object.entries(inputs).every(([key, value]) => {
    key_path.push(key);
    const value_for_key_in_schema = schema[key];

    if (
      typeof value === "object" &&
      value instanceof Object &&
      value_for_key_in_schema
    ) {
      return validate_inputs(
        value,
        value_for_key_in_schema,
        key_path,
        callback
      );
    }

    if (value_for_key_in_schema === String && typeof value !== "string") {
      callback({ error: `${key_path.join(".")} must be of type String.` });
      return false;
    }

    if (value_for_key_in_schema === Boolean && typeof value !== "boolean") {
      callback({ error: `${key_path.join(".")} must be of type Boolean.` });
      return false;
    }

    if (value_for_key_in_schema === Number && typeof value !== "number") {
      callback({ error: `${key_path.join(".")} must be of type Number.` });
      return false;
    }

    if (value_for_key_in_schema === undefined && typeof value !== "undefined") {
      callback({ error: `${key_path.join(".")} must be of type undefined.` });
      return false;
    }

    if (value_for_key_in_schema === null && typeof value !== "null") {
      callback({ error: `${key_path.join(".")} must be of type null.` });
      return false;
    }

    callback(null);

    return true;
  });
};

export default ({
  schema = null,
  inputs = null,
  context = "",
  context_name = "",
}) => {
  return new Promise((resolve) => {
    if (
      schema &&
      Object.keys(schema).length > 0 &&
      (!inputs || (inputs && Object.keys(inputs).length === 0))
    ) {
      resolve({
        error: `Missing inputs required by inputs schema for ${context_name} ${context}. Please double-check your ${context} inputs and try again.`,
      });
    }

    if (schema && inputs && Object.keys(inputs).length > 0) {
      validate_inputs(inputs, schema, [], (error) => {
        resolve(error);
      });
    }
  });
};
