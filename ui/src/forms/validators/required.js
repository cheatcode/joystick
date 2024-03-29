const required = (rule, value = "", options) => {
  if (!options.is_checkable) {
    return rule === true
      ? value && value.trim() !== ""
      : value && value.trim() === "";
  }

  if (options.is_checkable) {
    return rule === true ? value : !value;
  }
};

export default required;
