import types from '../../lib/types.js';
import validate_type from "./validate_type.js";
import is_array_path from "./is_array_path.js";

const allowed_values = (rule_value, input_value, parent_path) => {
  const isValid = rule_value.includes(input_value);

  if (!isValid) {
    return {
      valid: false,
      errors: [
        `Field ${parent_path} only allows the following values: ${rule_value.join(
          ", "
        )}.`,
      ],
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

const max_length = (rule_value, input_value, parent_path) => {
  const valid = types.is_array(input_value) && input_value?.length <= rule_value;

  if (!valid) {
    return {
      valid: false,
      errors: [
        `Field ${parent_path} length must be less than or equal to ${rule_value}.`,
      ],
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

const min_length = (rule_value, input_value, parent_path) => {
  const valid = types.is_array(input_value) && input_value?.length >= rule_value;

  if (!valid) {
    return {
      valid: false,
      errors: [
        `Field ${parent_path} length must be greater than or equal to ${rule_value}.`,
      ],
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

const input_validators = {
  types: [
	  "any",
	  "array",
	  "boolean",
	  "float",
	  "integer",
	  "number",
	  "object",
	  "string",
	],
  rules: {
    allowed_values,
    allowedValues: allowed_values,
    element: async (rule_value, input_value, parent_path, validate_input) => {
      // NOTE: Allow for element to be passed as a type string so you can do arrays of single
      // primitive elements (e.g., ['a', 'b', 'c'] or [1, 2, 3]).

      if (
        input_value &&
        (types.is_object(rule_value) || types.is_string(rule_value)) &&
        types.is_array(input_value)
      ) {
        // NOTE: Usage of .flatMap may seem excessive here but it's required because we're
        // doing recursive calls to validate_input of n depth. Each call returns
        // an array which means on complex nested schemas, we get back arrays of arrays of
        // error strings when really we just want one flat array for the full tree.
        const element_errors = await Promise.all(
          input_value.flatMap(async (element, element_index) => {
            const errors = await validate_input(
              element,
              types.is_string(rule_value) ? { type: rule_value } : rule_value,
              `${parent_path}.${element_index}`
            );

            return errors.flatMap((error) => error);
          })
        );

        return {
          valid: element_errors.length === 0,
          errors: element_errors.flatMap((element_error) => element_error),
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    fields: async (rule_value, input_value, parent_path, validate_input) => {
      if (types.is_object(rule_value) && types.is_object(input_value)) {
        const errors = await validate_input(input_value, rule_value, parent_path);

        return {
          valid: errors.length === 0,
          errors: [...errors],
        };
      }

      return {
        valid: false,
        errors: [
          `Field ${parent_path} must be of type object.`,
        ],
      };
    },
    max: (rule_value, input_value, parent_path) => {
      const valid = input_value <= rule_value;

      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parent_path} must be less than or equal to ${rule_value}.`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    max_length,
    maxLength: max_length,
    min: (rule_value, input_value, parent_path) => {
      const valid = input_value >= rule_value;

      if (!valid) {
        return {
          valid: false,
          errors: [
            `Field ${parent_path} must be greater than or equal to ${rule_value}.`,
          ],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    min_length,
    minLength: min_length,
    optional: (rule_value, input_value, parent_path) => {
      const valid = rule_value === false ? !!input_value : true;

      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parent_path} is required.`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    regex: (rule_value, input_value, parent_path) => {
      const valid = new RegExp(rule_value).test(input_value);

      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parent_path} must conform to regex: ${rule_value}.`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    required: (rule_value, input_value, parent_path) => {
      const valid = rule_value === false ? true : !!input_value;

      if (!valid) {
        return {
          valid: false,
          errors: [`Field ${parent_path} is required.`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
    type: (rule_value, input_value, parent_path) => {
      const valid = validate_type(rule_value, input_value);

      if (input_value && !valid) {
        return {
          valid: false,
          errors: [`Field ${parent_path} must be of type ${rule_value}.`],
        };
      }

      return {
        valid: true,
        errors: [],
      };
    },
  },
};

export default input_validators;
