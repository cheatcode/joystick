import runUserQuery from "./runUserQuery.js";

export default (userId = '') => {
  return runUserQuery('deleteUser', { userId });
};