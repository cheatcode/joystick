import runUserQuery from '../runUserQuery';

export default (role = '') => {
  return runUserQuery("addRole", { role });
}