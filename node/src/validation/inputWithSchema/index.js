import throwError from "../lib/throwError";
import validateSchema from "../schema/index";
import { isObject } from "../lib/typeValidators";
import isArrayPath from "../lib/isArrayPath";
import getValueFromObject from "../lib/getValueFromObject";
import constants from "../lib/constants";

const handleGetInputValue = (
  input = {},
  path = "",
  rulesOnlySchema = false
) => {
  if (rulesOnlySchema || (!rulesOnlySchema && !isObject(input))) {
    return input;
  }

  if (path.includes(".$.")) {
    const [arrayPath] = path.split(".$.");
    return getValueFromObject(input, arrayPath);
  }

  return getValueFromObject(input, path);
};

const getArrayPathKey = (arrayPath = "") => {
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
    inputValue: handleGetInputValue(input, pathToValue, rulesOnlySchema),
  };
};

const addToValidationQueue = (
  queue = [],
  schema = {},
  input = {},
  parentPath = ""
) => {
  // NOTE: If schema.type is present, we're forcing the schema for an array
  // item that's not an object (see element rule in /lib/constants.js).
  const rulesOnlySchema = !!schema.type;

  if (!rulesOnlySchema) {
    Object.entries(schema).forEach(([field, rules]) => {
      const path = `${parentPath ? `${parentPath}.${field}` : field}`;
      const validationTask = addValidationTask({
        queue,
        rules,
        input,
        path,
        rulesOnlySchema,
      });
      queue = [...queue, validationTask];
    });
  }

  if (rulesOnlySchema) {
    const path = parentPath || field;
    const validationTask = addValidationTask({
      queue,
      rules: schema,
      input,
      path,
      rulesOnlySchema,
    });
    queue = [...queue, validationTask];
  }

  return queue;
};

const validateInputWithSchema = (
  input = null,
  schema = null,
  parentPath = ""
) => {
  const errors = [];

  if (!input) {
    throwError("Must pass input.");
  }

  if (schema && Object.keys(schema) && !schema.type) {
    validateSchema(schema);
  }

  const queue = addToValidationQueue([], schema, input, parentPath);

  queue.forEach((validationTask) => {
    Object.entries(validationTask.rules).forEach(
      async ([ruleName, ruleValue]) => {
        const validator = constants.rules[ruleName];

        if (validator && !validationTask.path.includes(".$.")) {
          const result = validator(
            ruleValue,
            validationTask.inputValue,
            validationTask.path
          );

          if (result && !result.valid) {
            result.errors.forEach((error) => {
              errors.push(error.includes("Field ") ? error : `Field ${error}.`);
            });
          }
        }
      }
    );
  });

  return errors;
};

export default validateInputWithSchema;
