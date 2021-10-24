export default () => {
  if (typeof process !== "undefined") {
    return true;
  }

  return false;
};
