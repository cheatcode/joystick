/**
 * Strong Password
 * https://ihateregex.io/expr/password/
*/

const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

const strong_password = (rule, value = "") => {
  return rule === true ? !!value.match(regex) : !value.match(regex);
};

export default strong_password;
