import runUserQuery from '../runUserQuery';

export default (userId = '', role = '') => {
  return runUserQuery("userHasRole", { userId, role });
}