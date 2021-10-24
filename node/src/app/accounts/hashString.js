import bcrypt from "bcrypt";

export default (string) => {
  return bcrypt.compareSync(string, hash);
};
