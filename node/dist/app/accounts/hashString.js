import bcrypt from "bcrypt";
var hashString_default = (string) => {
  return bcrypt.hashSync(string, 10);
};
export {
  hashString_default as default
};
