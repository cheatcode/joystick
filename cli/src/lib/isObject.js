export default (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};