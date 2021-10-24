export default (path = "") => {
  return new RegExp(/\.[0-9]+\.?/g).test(path);
};
