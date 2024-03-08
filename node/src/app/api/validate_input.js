import get_value_from_object from './get_value_from_object.js';
import input_validators from './input_validators.js';
import is_array_path from './is_array_path.js';
import types from '../../lib/types.js';

export const handle_get_input_value = (
  input = null,
  path = '',
  types_only_schema = false
) => {
  if (path && !types.is_string(path)) {
    throw new Error('path must be passed as a string');
  }

  if (types_only_schema || (!types_only_schema && !types.is_object(input))) {
    return input;
  }

  if (path.includes(".$.")) {
    const [array_path] = path.split(".$.");
    return get_value_from_object(input, array_path);
  }

  return get_value_from_object(input, path);
};

const get_array_path_key = (array_path = "") => {
  if (!array_path) {
    return '';
  }

  if (array_path && !types.is_string(array_path)) {
    throw new Error('array_path must be a type of string');
  }

  const array_path_parts = array_path.split(".");

  return array_path_parts.pop();
};

const add_validation_task = ({ queue, rules, input, path, types_only_schema }) => {
  if (rules && rules.type === "object") {
    queue = add_to_validation_queue(queue, rules.properties, input, path);
  }

  if (rules && rules.type === "array" && types.is_object(rules.element)) {
    queue = add_to_validation_queue(queue, rules.element, input, `${path}.$`);
  }

  const path_to_value = is_array_path(path) ? get_array_path_key(path) : path;

  return {
    path,
    rules,
    input_value: handle_get_input_value(input, path_to_value, types_only_schema),
  };
};

const add_to_validation_queue = (
  queue = [],
  schema = {},
  input = {},
  parent_path = ''
) => {
  // NOTE: If schema.type is present, we're forcing the schema for an array
  // item that's not an object (see element rule in input_validators.js).

  // const types_only_schema = !!schema.type; // if schema.type is present, this is true.
  const types_only_schema = !!(schema.type && input_validators.types.includes(schema.type));

  if (!types_only_schema) {
  	const schema_definitions = Object.entries(schema || {});

  	for (let i = 0; i < schema_definitions?.length; i += 1) {
  		const [field, rules] = schema_definitions[i];
      const validation_task = add_validation_task({
        queue,
        rules,
        input,
        path: field,
        types_only_schema,
      });

      queue = [...queue, validation_task];
  	}
  }

  if (types_only_schema) {
    const validation_task = add_validation_task({
      queue,
      rules: schema,
      input,
      path: parent_path,
      types_only_schema,
    });

    queue = [...queue, validation_task];
  }

  return queue;
};

const validate_input = async (input = {}, schema = {}, parent_path = '') => {
	const validation_errors = [];
	const queue = add_to_validation_queue([], schema, input, parent_path);

	await Promise.all(queue.flatMap((validation_task) => {
		return Object.entries(validation_task.rules || {}).flatMap(async ([rule_name, rule_value]) => {
			const validator = input_validators.rules[rule_name];

			if (validator && !validation_task.path.includes('.$.')) {
				// NOTE: We pass validate_input as the final argument here so we can run
				// validation on nested array and objects. This avoids creating a circular
				// dependency error if we import validate_input into the input_validators file.
				const result = await validator(rule_value, validation_task.input_value, validation_task.path, validate_input);

				if (result && !result.valid) {
					for (let i = 0; i < result.errors.length; i += 1) {
						const error = result.errors[i];
						validation_errors.push(error);
					}
				}
			}
		});
	}));

	return validation_errors;
};

export default validate_input;
