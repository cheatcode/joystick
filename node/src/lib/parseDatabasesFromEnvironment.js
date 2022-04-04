export default (databases = "") => {
  if (databases && typeof databases === "string") {
    return JSON.parse(databases);
  }

  return {};
};
