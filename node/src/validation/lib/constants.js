import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { isObject, isArray, isString } from "./typeValidators";
import validateType from "./validateType";
import isArrayPath from "./isArrayPath";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const types = [
  "any",
  "array",
  "boolean",
  "float",
  "integer",
  "number",
  "object",
  "string",
];

export default {
  types,
  rules: {
    allowedValues: (ruleValue, inputValue, parentPath) => {
      const isValid = ruleValue.includes(inputValue);

      if (!isValid) {
        return {
          valid: false,
          errors: [
            `Field ${parentPath} only allows the following values: ${ruleValue.join(
              ", "
            )}.`,
          ],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    element: async (ruleValue, inputValue, parentPath) => {
      // NOTE: Allow for element to be passed as a type string so you can do arrays of single
      // primitive elements (e.g., ['a', 'b', 'c'] or [1, 2, 3]).

      if (
        inputValue &&
        (isObject(ruleValue) || isString(ruleValue)) &&
        isArray(inputValue)
      ) {
        const inputWithSchemaPath =
          process.env.NODE_ENV === "test"
            ? `../inputWithSchema`
            : `${__dirname.replace(
                "/dist/validation/lib",
                "/dist/validation"
              )}/inputWithSchema/index.js`;
        const inputWithSchemaFile = await import(inputWithSchemaPath);
        const inputWithSchema = inputWithSchemaFile.default;
        const validateInputWithSchema = isObject(inputWithSchema)
          ? inputWithSchema.default
          : inputWithSchema;

        const elementErrors = [];

        inputValue.forEach((element, elementIndex) => {
          const errors = validateInputWithSchema(
            element,
            isString(ruleValue) ? { type: ruleValue } : ruleValue,
            `${parentPath}.${elementIndex}`
          );

          errors.forEach((error) => {
            elementErrors.push(error);
          });
        });

        return Promise.resolve({
          valid: elementErrors.length === 0,
          errors: [...elementErrors],
        });
      }

      return Promise.resolve({
        valid: true,
        errors: [],
      });
    },
    fields: async (ruleValue, inputValue, parentPath) => {
      if (isObject(ruleValue) && isObject(inputValue)) {
        const inputWithSchemaPath =
          process.env.NODE_ENV === "test"
            ? `../inputWithSchema`
            : `${__dirname.replace(
                "/dist/validation/lib",
                "/dist/validation"
              )}/inputWithSchema/index.js`;
        const inputWithSchemaFile = await import(inputWithSchemaPath);
        const inputWithSchema = inputWithSchemaFile.default;
        const validateInputWithSchema = isObject(inputWithSchema)
          ? inputWithSchema.default
          : inputWithSchema;

        // NOTE: Complex. If we're NOT dealing with an array path, we're dealing with a normal
        // object path. Based on the schema structure for the type "object", fields: {} rules,
        // and how we run this all recursively, if we're dealing with an object path, we need to
        // "tack back on" wrap the parent field around the inputValue (child). This ensures that
        // the value path actually exists when this runs recursively (and the validator works).

        const input = isArrayPath(parentPath)
          ? inputValue
          : { [parentPath]: inputValue };

        const errors = validateInputWithSchema(input, ruleValue, parentPath);

        return Promise.resolve({
          valid: errors.length === 0,
          errors: [...errors],
        });
      }

      return Promise.resolve({
        valid: false,
        errors: [
          `${parentPath} schema rule and input value for element must be of type object.`,
        ],
      });
    },
    max: (ruleValue, inputValue, parentPath) => {
      const valid = inputValue <= ruleValue;

      if (!valid) {
        return {
          valid: false,
          errors: [`${parentPath} must be less than or equal to ${ruleValue}`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    min: (ruleValue, inputValue, parentPath) => {
      const valid = inputValue >= ruleValue;

      if (!valid) {
        return {
          valid: false,
          errors: [
            `${parentPath} must be greater than or equal to ${ruleValue}`,
          ],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    optional: (ruleValue, inputValue, parentPath) => {
      const valid = ruleValue === false ? !!inputValue : true;

      if (!valid) {
        return {
          valid: false,
          errors: [`${parentPath} is required`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    regex: (ruleValue, inputValue, parentPath) => {
      const valid = new RegExp(ruleValue).test(inputValue);

      if (!valid) {
        return {
          valid: false,
          errors: [`${parentPath} must conform to regex: ${ruleValue}`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    required: (ruleValue, inputValue, parentPath) => {
      const valid = ruleValue === false ? true : !!inputValue;

      if (!valid) {
        return {
          valid: false,
          errors: [`${parentPath} is required`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    type: (ruleValue, inputValue, parentPath) => {
      const valid = validateType(ruleValue, inputValue);

      if (inputValue && !valid) {
        return {
          valid: false,
          errors: [`${parentPath} must be of type ${ruleValue}`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
  },
};
