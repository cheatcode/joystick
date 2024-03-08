const regex = (regular_expression = '', value = "") => {
  return (value?.match(regular_expression) || [])?.length > 0;
};

export default regex;
