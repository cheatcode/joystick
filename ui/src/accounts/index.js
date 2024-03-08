import authenticated from './authenticated.js';
import login from "./login.js";
import logout from "./logout.js";
import recover_password from "./recover_password.js";
import reset_password from "./reset_password.js";
import signup from "./signup.js";
import user from './user.js';

const accounts = {
  authenticated,
  login,
  logout,
  recoverPassword: recover_password,
  recover_password,
  resetPassword: reset_password,
  reset_password,
  signup,
  user,
};

export default accounts;
