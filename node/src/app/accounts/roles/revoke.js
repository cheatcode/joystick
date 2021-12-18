import runUserQuery from '../runUserQuery';

export default (userId = '', role = '') => {
  return runUserQuery("revokeRole", { userId, role });
}