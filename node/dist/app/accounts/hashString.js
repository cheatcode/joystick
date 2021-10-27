import bcrypt from "bcrypt";
var hashString_default = (string) => {
  return bcrypt.compareSync(string, hash);
};
export {
  hashString_default as default
};
