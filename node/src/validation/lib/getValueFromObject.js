const getValueFromObject = (object, path) => {
  if (!path) return object;
  if (!object) return undefined;
  const properties = path.split(".");
  return getValueFromObject(object[properties.shift()], properties.join("."));
};

export default getValueFromObject;
