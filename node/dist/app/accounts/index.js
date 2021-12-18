import signup from "./signup";
import login from "./login";
import recoverPassword from "./recoverPassword";
import resetPassword from "./resetPassword";
import roles from "./roles";
import _setAuthenticationCookie from "./setAuthenticationCookie.js";
import _unsetAuthenticationCookie from "./unsetAuthenticationCookie.js";
var accounts_default = {
  signup,
  login,
  recoverPassword,
  resetPassword,
  roles,
  _setAuthenticationCookie,
  _unsetAuthenticationCookie
};
export {
  accounts_default as default
};
