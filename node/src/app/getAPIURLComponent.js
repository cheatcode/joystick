export default (string = "") => {
  return string.toLowerCase().replace(/\ /g, "-");
};
