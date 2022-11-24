/*
  Regex from https://ihateregex.io/expr/password/
*/

const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

export default (rule, value = "") => {
  return rule === true ? !!value.match(regex) : !value.match(regex);
};
