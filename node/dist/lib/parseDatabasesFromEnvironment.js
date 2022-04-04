var parseDatabasesFromEnvironment_default = (databases = "") => {
  if (databases && typeof databases === "string") {
    console.log("DATABASES", databases);
    return JSON.parse(databases);
  }
  return {};
};
export {
  parseDatabasesFromEnvironment_default as default
};
