import generateResetToken from "./generateResetToken";
import sendEmail from "../../email/send";
import settings from "../../settings";

export default async (options = {}) => {
  try {
    const resetToken = await generateResetToken({
      emailAddress: options.emailAddress,
    });

    const domain = process.env.ROOT_URL || `http://localhost:${process.env.PORT}`;
    const url = `${domain}/reset-password/${resetToken}`;

    if (process.env.NODE_ENV === "development") {
      console.log({ url });
    }

    if (typeof process.joystick?._app?.options?.accounts?.onRecoverPassword === 'function') {
      process.joystick?._app?.options?.accounts?.onRecoverPassword(options?.emailAddress);
    }

    await sendEmail({
      to: options.emailAddress,
      from: settings?.config?.email?.from,
      subject: "Reset Your Password",
      template: "reset-password",
      props: {
        emailAddress: options.emailAddress,
        url,
      },
    });

    return true;
  } catch (exception) {}
};
