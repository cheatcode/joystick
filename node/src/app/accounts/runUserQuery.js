import queryMap from "../databases/queryMap";
import getTargetDatabaseConnection from "../databases/getTargetDatabaseConnection.js";

export default async (queryName = "", inputs = {}) => {
  const usersDatabase = getTargetDatabaseConnection('users');
  const queryMapForDatabase = usersDatabase && queryMap && queryMap[usersDatabase?.provider] && queryMap[usersDatabase?.provider]?.accounts;
  const query = queryMapForDatabase && queryMapForDatabase[queryName];

  if (usersDatabase?.connection && query) {
    const response = await queryMapForDatabase[queryName](inputs, usersDatabase?.connection);
    return Promise.resolve(response);
  }

  return null;
};
