import unsetCookie from "../../lib/unsetCookie.js";
var unsetAuthenticationCookie_default = (res = null) => {
  if (!res)
    return null;
  unsetCookie("joystickLoginToken", res);
  unsetCookie("joystickLoginTokenExpiresAt", res);
  return res;
};
export {
  unsetAuthenticationCookie_default as default
};
