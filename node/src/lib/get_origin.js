const get_origin = () => {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT}`
    : process.env.ROOT_URL;
};

export default get_origin;
