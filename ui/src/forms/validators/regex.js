export default (regex = '', value = "") => {
  return (value?.match(regex) || [])?.length > 0;
};
