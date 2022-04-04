export default (databases = "") => {
  if (databases && typeof databases === "string") {
    console.log('DATABASES', databases);
    return JSON.parse(databases);
  }

  return {};
};
