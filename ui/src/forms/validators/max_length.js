const max_length = (rule, value = "") => {
  return value.length <= rule;
};

export default max_length;