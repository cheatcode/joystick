const getValueFromObject = (object, path) => {
  if (!path)
    return object;
  if (!object)
    return void 0;
  const properties = path.split(".");
  return getValueFromObject(object[properties.shift()], properties.join("."));
};
var getValueFromObject_default = getValueFromObject;
export {
  getValueFromObject_default as default
};
