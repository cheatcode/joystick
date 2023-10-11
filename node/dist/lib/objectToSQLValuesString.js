import { isObject } from "../validation/lib/typeValidators";
const objectToSQLValues = (objectToConvert = {}, target = []) => {
  const keyValuePairs = Object.entries(objectToConvert || {});
  keyValuePairs.forEach(([_key, value]) => {
    if (isObject(value)) {
      objectToSQLValues(value, target);
    } else {
      target.push(`'${value}'`);
    }
  });
  return target.flatMap((value) => value).join(", ");
};
var objectToSQLValuesString_default = objectToSQLValues;
export {
  objectToSQLValuesString_default as default
};
