/*
  Regex from https://ihateregex.io/expr/url-slug/
*/

const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default (rule, value = "") => {
  return rule === true ? !!value.match(regex) : !value.match(regex);
};
