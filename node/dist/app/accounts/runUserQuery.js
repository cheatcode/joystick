import getTargetDatabase from "../databases/getTargetDatabase";
import queryMap from "../databases/queryMap";
var runUserQuery_default = async (queryName = "", inputs = {}) => {
  const usersDatabase = getTargetDatabase("users");
  const queryMapForDatabase = usersDatabase && queryMap && queryMap[usersDatabase] && queryMap[usersDatabase]?.accounts;
  const query = queryMapForDatabase && queryMapForDatabase[queryName];
  if (process?.databases && process?.databases[usersDatabase] && query) {
    const response = await queryMapForDatabase[queryName](inputs);
    return Promise.resolve(response);
  }
  return null;
};
export {
  runUserQuery_default as default
};
