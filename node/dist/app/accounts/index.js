import signup from "./signup";
import login from "./login";
import recoverPassword from "./recoverPassword";
import resetPassword from "./resetPassword";
import setAuthenticationCookie from "./setAuthenticationCookie.js";
import unsetAuthenticationCookie from "./unsetAuthenticationCookie.js";
var accounts_default = {
  signup,
  login,
  recoverPassword,
  resetPassword,
  setAuthenticationCookie,
  unsetAuthenticationCookie
};
export {
  accounts_default as default
};
