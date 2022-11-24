import throwError from "../lib/throwError";
import validateSchema from "../schema/index";
import { isObject, isString } from "../lib/typeValidators";
import isArrayPath from "../lib/isArrayPath";
import getValueFromObject from "../lib/getValueFromObject";
import constants from "../lib/constants";
const handleGetInputValue = (input = null, path = "", rulesOnlySchema = false) => {
  if (path && !isString(path)) {
    throw new Error("path must be passed as a string");
  }
  if (rulesOnlySchema || !rulesOnlySchema && !isObject(input)) {
    return input;
  }
  if (path.includes(".$.")) {
    const [arrayPath] = path.split(".$.");
    return getValueFromObject(input, arrayPath);
  }
  return getValueFromObject(input, path);
};
const getArrayPathKey = (arrayPath = "") => {
  if (!arrayPath) {
    return "";
  }
  if (arrayPath && !isString(arrayPath)) {
    throw new Error("arrayPath must be a type of string");
  }
  const arrayPathParts = arrayPath.split(".");
  return arrayPathParts.pop();
};
const addValidationTask = ({ queue, rules, input, path, rulesOnlySchema }) => {
  if (rules && rules.type === "object") {
    queue = addToValidationQueue(queue, rules.properties, input, path);
  }
  if (rules && rules.type === "array" && isObject(rules.element)) {
    queue = addToValidationQueue(queue, rules.element, input, `${path}.$`);
  }
  const pathToValue = isArrayPath(path) ? getArrayPathKey(path) : path;
  return {
    path,
    rules,
    inputValue: handleGetInputValue(input, pathToValue, rulesOnlySchema)
  };
};
const addToValidationQueue = (queue = [], schema = {}, input = {}, parentPath = "") => {
  if (queue && !Array.isArray(queue)) {
    throw new Error("queue must be an array");
  }
  const rulesOnlySchema = !!(schema.type && constants.types.includes(schema.type));
  if (!rulesOnlySchema) {
    Object.entries(schema).forEach(([field, rules]) => {
      const path = `${parentPath ? `${parentPath}.${field}` : field}`;
      const validationTask = addValidationTask({
        queue,
        rules,
        input,
        path,
        rulesOnlySchema
      });
      queue = [...queue, validationTask];
    });
  }
  if (rulesOnlySchema) {
    const path = parentPath;
    const validationTask = addValidationTask({
      queue,
      rules: schema,
      input,
      path,
      rulesOnlySchema
    });
    queue = [...queue, validationTask];
  }
  return queue;
};
const validateInputWithSchema = async (input = null, schema = null, parentPath = "") => {
  const errors = [];
  if (!input) {
    throwError("Must pass input.");
  }
  if (schema && Object.keys(schema) && !schema.type) {
    validateSchema(schema);
  }
  const queue = addToValidationQueue([], schema, input, parentPath);
  await Promise.all(queue.flatMap((validationTask) => {
    return Object.entries(validationTask.rules).flatMap(async ([ruleName, ruleValue]) => {
      const validator = constants.rules[ruleName];
      if (validator && !validationTask.path.includes(".$.")) {
        const result = await validator(ruleValue, validationTask.inputValue, validationTask.path);
        if (result && !result.valid) {
          return result.errors.forEach((error) => {
            return errors.push(error);
          });
        }
      }
    });
  }));
  return errors;
};
var inputWithSchema_default = validateInputWithSchema;
export {
  addToValidationQueue,
  inputWithSchema_default as default,
  getArrayPathKey,
  handleGetInputValue
};
