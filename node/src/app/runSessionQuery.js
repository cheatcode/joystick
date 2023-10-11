import queryMap from "./databases/queryMap";
import getTargetDatabaseConnection from "./databases/getTargetDatabaseConnection.js";

export default async (queryName = "", inputs = {}) => {
  const sessionsDatabase = getTargetDatabaseConnection('sessions');
  const queryMapForDatabase = sessionsDatabase && queryMap && queryMap[sessionsDatabase?.provider] && queryMap[sessionsDatabase?.provider]?.sessions;
  const query = queryMapForDatabase && queryMapForDatabase[queryName];

  if (sessionsDatabase?.connection && query) {
    const response = await queryMapForDatabase[queryName](inputs, sessionsDatabase?.connection);
    return Promise.resolve(response);
  }

  return null;
};
