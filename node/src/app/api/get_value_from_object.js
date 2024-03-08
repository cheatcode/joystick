const get_value_from_object = (object, path = '') => {
  if (!path) return object;
  if (!object) return undefined;
  const properties = path.split(".");
  return get_value_from_object(object[properties.shift()], properties.join("."));
};

export default get_value_from_object;
