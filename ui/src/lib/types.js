const is_any = (value) => {
  return !!value;
};

const is_array = (value) => {
  return !!Array.isArray(value);
};

const is_boolean = (value) => {
  return (value === true || value === false);
};

const is_float = (value) => {
  return Number(value) === value && value % 1 !== 0;
};

const is_function = (value) => {
  return typeof value === 'function';
};

const is_integer = (value) => {
  return Number(value) === value && value % 1 === 0;
};

const is_null = (value) => {
  return value === null;
};

const is_number = (value) => {
  return Number(value) === value;
};

const is_object = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};

const is_string = (value) => {
  return typeof value === "string";
};

const is_undefined = (value) => {
  return typeof value === 'undefined';
};

const types = {
	is_any,
	is_array,
	is_boolean,
	is_float,
	is_function,
	is_integer,
	is_null,
	is_number,
	is_object,
	is_string,
	is_undefined,
};

export default types;
