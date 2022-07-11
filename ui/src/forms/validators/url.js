/*
  Regex from https://ihateregex.io/expr/url/
*/

const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;

export default (rule, value = "") => {
  return rule === true ? !!value.match(regex) : !value.match(regex);
};
