import getUsersDatabase from "./getUsersDatabase";
import userQueries from "./userQueries";

export default async (queryName = "", inputs = {}) => {
  const usersDatabase = getUsersDatabase();
  const queryMapForDatabase = usersDatabase && userQueries[usersDatabase];
  const query = queryMapForDatabase && queryMapForDatabase[queryName];

  if (query) {
    const response = await queryMapForDatabase[queryName](inputs);
    return Promise.resolve(response);
  }

  return null;
};
