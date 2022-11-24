export default (rule, value = "", options = { isChecked: false }) => {
  if (!options.isChecked) {
    return rule === true
      ? value && value.trim() !== ""
      : value && value.trim() === "";
  }

  if (options.isChecked) {
    return rule === true ? value : !value;
  }
};
