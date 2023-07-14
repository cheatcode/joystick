import unsetCookie from "../../lib/unsetCookie.js";

export default (res = null) => {
  if (!res) return null;

  unsetCookie('joystickLoginToken', res);
  unsetCookie('joystickLoginTokenExpiresAt', res);

  return res;
};
