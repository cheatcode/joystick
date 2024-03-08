const min_length = (rule, value = "") => {
  return value.length >= rule;
};

export default min_length;
