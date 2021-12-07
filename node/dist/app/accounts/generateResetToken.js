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
const generateResetToken = async (options, { resolve, reject: reject2 }) => {
  try {
    if (!options.emailAddress) {
      return reject2("Email address is required.");
    }
    const token = crypto.randomString(32);
    await setTokenOnUser(options.emailAddress, token);
    resolve(token);
  } catch (exception) {
    reject2(formatErrorString("generateResetToken", exception));
  }
};
var generateResetToken_default = (options) => new Promise((resolve, reject2) => {
  generateResetToken(options, { resolve, reject: reject2 });
});
export {
  generateResetToken_default as default
};
