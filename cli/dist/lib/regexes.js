const OBJECT_REGEX = new RegExp(/{([^;]*)}/g);
const EXPORT_DEFAULT_REGEX = new RegExp(/export default [a-zA-Z0-9]+/g);
export {
  EXPORT_DEFAULT_REGEX,
  OBJECT_REGEX
};
