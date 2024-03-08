/**
 * Slug
 * https://ihateregex.io/expr/url-slug/
 */

const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slug = (rule, value = "") => {
  return rule === true ? !!value.match(regex) : !value.match(regex);
};

export default slug;
