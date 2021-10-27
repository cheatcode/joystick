var getOrigin_default = () => {
  return process.env.NODE_ENV === "development" ? `http://localhost:${process.env.PORT}` : process.env.ROOT_URL;
};
export {
  getOrigin_default as default
};
