/* eslint-disable consistent-return */

import crypto from "crypto-extra";
import formatErrorString from "../../lib/formatErrorString";
import runUserQuery from "./runUserQuery";

const setTokenOnUser = (emailAddress = "", token = "") => {
  try {
    return runUserQuery("addPasswordResetToken", { emailAddress, token });
  } catch (exception) {
    reject(formatErrorString("generateResetToken.setTokenOnUser", exception));
  }
};

const generateResetToken = async (options, { resolve, reject }) => {
  try {
    if (!options.emailAddress) {
      return reject("Email address is required.");
    }

    const token = crypto.randomString(32);

    await setTokenOnUser(options.emailAddress, token);
    console.log({ options, token });

    resolve(token);
  } catch (exception) {
    reject(formatErrorString("generateResetToken", exception));
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    generateResetToken(options, { resolve, reject });
  });
