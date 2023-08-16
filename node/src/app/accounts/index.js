import _setAuthenticationCookie from "./setAuthenticationCookie.js";
import _unsetAuthenticationCookie from "./unsetAuthenticationCookie.js";
import defaultUserOutputFields from "./defaultUserOutputFields";
import deleteUser from './deleteUser.js';
import getBrowserSafeUser from "./getBrowserSafeUser";
import login from "./login";
import recoverPassword from "./recoverPassword";
import resetPassword from "./resetPassword";
import roles from "./roles";
import sendEmailVerification from "./sendEmailVerification";
import setPassword from "./setPassword";
import signup from "./signup";
import verifyEmail from "./verifyEmail.js";

export default {
  _setAuthenticationCookie,
  _unsetAuthenticationCookie,
  defaultUserOutputFields,
  deleteUser,
  getBrowserSafeUser,
  login,
  recoverPassword,
  resetPassword,
  roles,
  sendEmailVerification,
  setPassword,
  signup,
  verifyEmail,
};
