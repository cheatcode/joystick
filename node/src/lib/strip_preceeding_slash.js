const strip_preceeding_slash = (string = '') => {
  return string.charAt(0) === '/' ? string.slice(1) : string;
};

export default strip_preceeding_slash;