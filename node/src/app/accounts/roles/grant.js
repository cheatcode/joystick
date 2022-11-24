import runUserQuery from '../runUserQuery';

export default (userId = '', role = '') => {
  return runUserQuery("grantRole", { userId, role });
}