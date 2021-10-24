import generateResetToken from "./generateResetToken";
import sendEmail from "../../email/send";
import settings from "../../settings";

export default async (options = {}) => {
  try {
    const resetToken = await generateResetToken({
      emailAddress: options.emailAddress,
    });

    const url = `${options.origin}/reset-password/${resetToken}`;

    if (process.env.NODE_ENV === "development") {
      console.log({ url });
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
