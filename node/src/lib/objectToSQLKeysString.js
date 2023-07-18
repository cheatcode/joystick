import { isObject } from "../validation/lib/typeValidators";
import camelPascalToSnake from "./camelPascalToSnake";

const objectToSQLKeys = (objectToConvert = {}, target = []) => {
  const keyValuePairs = Object.entries(objectToConvert);

  keyValuePairs.forEach(([key, value]) => {
    if (isObject(value)) {
      // NOTE: Convert camel and pascal case column names to snake case for consistency.
      target.push(camelPascalToSnake(key));
      objectToSQLKeys(value, target);
    } else {
      target.push(camelPascalToSnake(key));
    }
  });

  return target.flatMap((value) => value).join(', ');
};

export default objectToSQLKeys;
