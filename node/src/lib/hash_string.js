import bcrypt from "bcrypt";

const hash_string = (string = '') => {
  return bcrypt.hashSync(string, 10);
};

export default hash_string;
