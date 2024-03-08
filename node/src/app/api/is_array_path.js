const is_array_path = (path = '') => {
  return new RegExp(/\.[0-9]+\.?/g).test(path);
};

export default is_array_path;

