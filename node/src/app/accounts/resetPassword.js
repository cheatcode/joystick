import hashString from "./hashString";
import runUserQuery from "./runUserQuery";
import generateSession from "./generateSession";

const removeTokenFromUser = (userId = null, token = null) => {
  try {
    return runUserQuery("removeResetToken", { userId, token });
  } catch (error) {
    throw new Error(
      formatErrorString("resetPassword.removeTokenFromUser", error)
    );
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
    throw new Error(
      `[resetPassword.setNewPasswordOnUser] ${exception.message}`
    );
  }
};

const getUserWithToken = (token = "") => {
  try {
    return runUserQuery("userWithResetToken", {
      "passwordResetTokens.token": token,
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

    const hashedNewPassword = await setNewPasswordOnUser(
      user?._id,
      options.password
    );

    const session = await generateSession({
      userId: user?._id,
      emailAddress: user?.emailAddress,
      password: hashedNewPassword,
    });

    await addSessionToUser(user?._id, session);
    await removeTokenFromUser(user?._id, options.token);

    resolve({
      user,
      ...session,
    });
  } catch (exception) {
    reject(`[resetPassword] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    resetPassword(options, { resolve, reject });
  });
