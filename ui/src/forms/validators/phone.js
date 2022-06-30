/*
  Regex from https://ihateregex.io/expr/phone/
*/

const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export default (rule, value = "") => {
  return rule === true
    ? !!value.match(regex)
    : !value.match(regex);
};
