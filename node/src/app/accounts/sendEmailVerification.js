/* eslint-disable consistent-return */

import loadSettings from "../../settings/load";
import sendEmail from "../../email/send";
import runUserQuery from "./runUserQuery";

const sendVerificationEmail = (emailAddress = "", token = "") => {
  try {
    const settings = loadSettings();

    return sendEmail({
      to: emailAddress,
      from: settings?.config?.email?.from,
      subject:
        settings?.config?.email?.verify?.subject || "Verify your email address",
      template: settings?.config?.email?.verify?.template || "verify-email",
      props: {
        emailAddress,
        url:
          process.env.NODE_ENV === "development"
            ? `http://localhost:${process.env.PORT}/api/_accounts/verify-email?token=${token}`
            : `${process.env.ROOT_URL}/api/_accounts/verify-email?token=${token}`,
      },
    });
  } catch (exception) {
    throw new Error(
      `[sendEmailVerification.sendVerificationEmail] ${exception.message}`
    );
  }
};

const getEmailVerificationToken = (userId = "") => {
  try {
    return runUserQuery("createEmailVerificationToken", {
      userId,
    });
  } catch (exception) {
    throw new Error(
      `[sendEmailVerification.getEmailVerificationToken] ${exception.message}`
    );
  }
};

const getUser = (userId = "") => {
  try {
    return runUserQuery("user", { _id: userId });
  } catch (exception) {
    throw new Error(`[sendEmailVerification.getUser] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error("options object is required.");
    if (!options.userId) throw new Error("options.userId is required.");
  } catch (exception) {
    throw new Error(
      `[sendEmailVerification.validateOptions] ${exception.message}`
    );
  }
};

const sendEmailVerification = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    const user = await getUser(options?.userId);

    if (!user?.emailVerified && !user?.emailVerifiedAt) {
      const token = await getEmailVerificationToken(user?._id || user?.user_id);
      await sendVerificationEmail(user?.emailAddress, token);
    }

    resolve();
  } catch (exception) {
    reject(`[sendEmailVerification] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    sendEmailVerification(options, { resolve, reject });
  });
