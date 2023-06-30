/* eslint-disable consistent-return */

import runUserQuery from "./runUserQuery";

const markEmailVerifiedAt = (userId = "", token = "") => {
  try {
    return runUserQuery("markEmailVerifiedAt", { userId, token });
  } catch (exception) {
    throw new Error(`[actionName.markEmailVerifiedAt] ${exception.message}`);
  }
};

const getUserFromToken = (verifyEmailToken = "") => {
  try {
    return runUserQuery("userWithVerifyEmailToken", {
      token: verifyEmailToken,
    });
  } catch (exception) {
    throw new Error(`[verifyEmail.getUserFromToken] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error("options object is required.");
    if (!options.token) throw new Error("options.token is required.");
  } catch (exception) {
    throw new Error(`[verifyEmail.validateOptions] ${exception.message}`);
  }
};

const verifyEmail = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    const user = await getUserFromToken(options?.token);

    if (!user) {
      throw new Error(`A user with this token could not be found.`);
    }

    await markEmailVerifiedAt(user?._id || user?.user_id, options?.token);

    resolve();
  } catch (exception) {
    reject(`[verifyEmail] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    verifyEmail(options, { resolve, reject });
  });
