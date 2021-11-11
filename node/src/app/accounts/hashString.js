import bcrypt from "bcrypt";

export default (string) => {
  return bcrypt.hashSync(string, 10);
};
