import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { isObject, isArray, isString } from "./typeValidators";
import validateType from "./validateType";
import isArrayPath from "./isArrayPath";
const require2 = createRequire(import.meta.url);
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
  "string"
];
var constants_default = {
  types,
  rules: {
    allowedValues: (ruleValue, inputValue, parentPath) => {
      const isValid = ruleValue.includes(inputValue);
      if (!isValid) {
        return {
          valid: false,
          errors: [
            `Field ${parentPath} only allows the following values: ${ruleValue.join(", ")}.`
          ]
        };
      }
      return {
        valid: true,
        errors: []
      };
    },
    element: async (ruleValue, inputValue, parentPath) => {
      if (inputValue && (isObject(ruleValue) || isString(ruleValue)) && isArray(inputValue)) {
        const inputWithSchemaPath = process.env.NODE_ENV === "test" ? `../inputWithSchema` : `${__dirname.replace("/dist/validation/lib", "/dist/validation").replace("/src/validation/lib", "/src/validation")}/inputWithSchema/index.js`;
        const inputWithSchemaFile = await import(inputWithSchemaPath);
        const inputWithSchema = inputWithSchemaFile.default;
        const validateInputWithSchema = isObject(inputWithSchema) ? inputWithSchema.default : inputWithSchema;
        const elementErrors = await Promise.all(inputValue.flatMap(async (element, elementIndex) => {
          const errors = await validateInputWithSchema(element, isString(ruleValue) ? { type: ruleValue } : ruleValue, `${parentPath}.${elementIndex}`);
          return errors.flatMap((error) => error);
        }));
        return {
          valid: elementErrors.length === 0,
          errors: elementErrors.flatMap((elementError) => elementError)
        };
      }
      return {
        valid: true,
        errors: []
      };
    },
    fields: async (ruleValue, inputValue, parentPath) => {
      if (isObject(ruleValue) && isObject(inputValue)) {
        const inputWithSchemaPath = process.env.NODE_ENV === "test" ? `../inputWithSchema` : `${__dirname.replace("/dist/validation/lib", "/dist/validation").replace("/src/validation/lib", "/src/validation")}/inputWithSchema/index.js`;
        const inputWithSchemaFile = await import(inputWithSchemaPath);
        const inputWithSchema = inputWithSchemaFile.default;
        const validateInputWithSchema = isObject(inputWithSchema) ? inputWithSchema.default : inputWithSchema;
        const input = isArrayPath(parentPath) ? inputValue : { [parentPath]: inputValue };
        const errors = await validateInputWithSchema(input, ruleValue, parentPath);
        return {
          valid: errors.length === 0,
          errors: [...errors]
        };
      }
      return {
        valid: false,
        errors: [
          `Field ${parentPath} schema rule and input value for element must be of type object.`
        ]
      };
    },
    max: (ruleValue, inputValue, parentPath) => {
      const valid = inputValue <= ruleValue;
      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parentPath} must be less than or equal to ${ruleValue}.`]
        };
      }
      return {
        valid: true,
        errors: []
      };
    },
    min: (ruleValue, inputValue, parentPath) => {
      const valid = inputValue >= ruleValue;
      if (!valid) {
        return {
          valid: false,
          errors: [
            `Field ${parentPath} must be greater than or equal to ${ruleValue}.`
          ]
        };
      }
      return {
        valid: true,
        errors: []
      };
    },
    optional: (ruleValue, inputValue, parentPath) => {
      const valid = ruleValue === false ? !!inputValue : true;
      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parentPath} is required.`]
        };
      }
      return {
        valid: true,
        errors: []
      };
    },
    regex: (ruleValue, inputValue, parentPath) => {
      const valid = new RegExp(ruleValue).test(inputValue);
      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parentPath} must conform to regex: ${ruleValue}.`]
        };
      }
      return {
        valid: true,
        errors: []
      };
    },
    required: (ruleValue, inputValue, parentPath) => {
      const valid = ruleValue === false ? true : !!inputValue;
      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parentPath} is required.`]
        };
      }
      return {
        valid: true,
        errors: []
      };
    },
    type: (ruleValue, inputValue, parentPath) => {
      const valid = validateType(ruleValue, inputValue);
      if (inputValue && !valid) {
        return {
          valid: false,
          errors: [`Field ${parentPath} must be of type ${ruleValue}.`]
        };
      }
      return {
        valid: true,
        errors: []
      };
    }
  }
};
export {
  constants_default as default
};
