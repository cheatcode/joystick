var parseDatabasesFromEnvironment_default = (databases = "") => {
  if (databases && typeof databases === "string") {
    return JSON.parse(databases);
  }
  return {};
};
export {
  parseDatabasesFromEnvironment_default as default
};
