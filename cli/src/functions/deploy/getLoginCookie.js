export default (loginToken = '', loginTokenExpiresAt = '') => {
  return `joystickLoginToken=${loginToken};joystickLoginTokenExpiresAt=${loginTokenExpiresAt};`;
};