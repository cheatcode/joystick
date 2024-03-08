/**
 * Semver
 * https://ihateregex.io/expr/semver/
 */

const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const semver = (rule, value = "") => {
  return rule === true
    ? !!value.match(regex)
    : !value.match(regex);
};

export default semver;
