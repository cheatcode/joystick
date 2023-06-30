import hashString from "./hashString";
import runUserQuery from "./runUserQuery";

const deleteOldSessions = (userId = null) => {
  try {
    return runUserQuery("deleteOldSessions", { userId });
  } catch (error) {
    throw new Error(formatErrorString("setPassword.deleteOldSessions", error));
  }
};

const setNewPasswordOnUser = async (userId = "", password = "") => {
  try {
    const hashedPassword = await hashString(password);
    await runUserQuery("setNewPassword", { userId, hashedPassword });
    return hashedPassword;
  } catch (exception) {
    throw new Error(`[setPassword.setNewPasswordOnUser] ${exception.message}`);
  }
};

const getUser = (userId = "") => {
  try {
    return runUserQuery("user", { _id: userId });
  } catch (exception) {
    throw new Error(`[setPassword.getUser] ${exception.message}`);
  }
};

const setPassword = async (options, { resolve, reject }) => {
  try {
    const user = await getUser(options.userId);

    if (!user) {
      reject("Sorry, that userId is invalid. Please try again.");
      return;
    }

    await setNewPasswordOnUser(user?._id || user?.user_id, options.password);
    await deleteOldSessions(user?._id || user?.user_id);

    resolve();
  } catch (exception) {
    reject(`[setPassword] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    setPassword(options, { resolve, reject });
  });
