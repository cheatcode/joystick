import hashString from "./hashString";
import runUserQuery from "./runUserQuery";
import generateSession from "./generateSession";
import getOutput from "../getOutput";
const deleteOldSessions = (userId = null) => {
  try {
    return runUserQuery("deleteOldSessions", { userId });
  } catch (error) {
    throw new Error(formatErrorString("resetPassword.deleteOldSessions", error));
  }
};
const removeTokenFromUser = (userId = null, token = null) => {
  try {
    return runUserQuery("removeResetToken", { userId, token });
  } catch (error) {
    throw new Error(formatErrorString("resetPassword.removeTokenFromUser", error));
  }
};
const addSessionToUser = (userId = null, session = null) => {
  try {
    return runUserQuery("addSession", { userId, session });
  } catch (error) {
    throw new Error(formatErrorString("resetPassword.addSessionToUser", error));
  }
};
const setNewPasswordOnUser = async (userId = "", password = "") => {
  try {
    const hashedPassword = await hashString(password);
    await runUserQuery("setNewPassword", { userId, hashedPassword });
    return hashedPassword;
  } catch (exception) {
    throw new Error(`[resetPassword.setNewPasswordOnUser] ${exception.message}`);
  }
};
const getUserWithToken = (token = "") => {
  try {
    return runUserQuery("userWithResetToken", {
      "passwordResetTokens.token": token
    });
  } catch (exception) {
    throw new Error(`[resetPassword.getUserWithToken] ${exception.message}`);
  }
};
const resetPassword = async (options, { resolve, reject }) => {
  try {
    const user = await getUserWithToken(options.token);
    if (!user) {
      reject("Sorry, that token is invalid. Please try again.");
      return;
    }
    const hashedNewPassword = await setNewPasswordOnUser(user?._id || user?.user_id, options.password);
    const updatedUser = await removeTokenFromUser(user?._id || user?.user_id, options.token);
    await deleteOldSessions(user?._id || user?.user_id);
    const session = await generateSession({
      userId: updatedUser?._id || updatedUser?.user_id,
      emailAddress: updatedUser?.emailAddress || updatedUser?.email_address,
      password: hashedNewPassword
    });
    await addSessionToUser(updatedUser?._id || updatedUser?.user_id, session);
    if (typeof process.joystick?._app?.options?.accounts?.onResetPassword === "function") {
      process.joystick?._app?.options?.accounts?.onResetPassword({
        user: updatedUser,
        ...session
      });
    }
    resolve({
      user: getOutput(updatedUser, options?.output),
      ...session
    });
  } catch (exception) {
    reject(`[resetPassword] ${exception.message}`);
  }
};
var resetPassword_default = (options) => new Promise((resolve, reject) => {
  resetPassword(options, { resolve, reject });
});
export {
  resetPassword_default as default
};
