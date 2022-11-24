import getUsersDatabase from "./getUsersDatabase";
import userQueries from "./userQueries";
var runUserQuery_default = async (queryName = "", inputs = {}) => {
  const usersDatabase = getUsersDatabase();
  const queryMapForDatabase = usersDatabase && userQueries[usersDatabase];
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
