import accounts_query from "../databases/queries/accounts.js";
import load_settings from "../settings/load.js";
import send_email from "../email/send.js";

const send_verification_email = (email_address = "", token = "") => {
  const settings = load_settings();

  return send_email({
    to: email_address,
    from: settings?.config?.email?.from,
    subject:
      settings?.config?.email?.verify?.subject || "Verify your email address",
    template: settings?.config?.email?.verify?.template || "verify_email",
    props: {
      // NOTE: Keep camelCase for backwards compatibility.
      emailAddress: email_address,
      email_address,
      url:
        process.env.NODE_ENV === "development"
          ? `http://localhost:${process.env.PORT}/api/_accounts/verify_email?token=${token}`
          : `${process.env.ROOT_URL}/api/_accounts/verify_email?token=${token}`,
    },
  });
};

const get_email_verification_token = (user_id = "") => {
  return accounts_query("create_email_verification_token", {
    user_id,
  });
};

const get_user = (user_id = "") => {
  return accounts_query("user", { _id: user_id });
};

const send_email_verification = async (user_id = '') => {
  const user = await get_user(user_id);

  if (!user?.emailVerified && !user?.emailVerifiedAt) {
    const token = await get_email_verification_token(user?._id || user?.user_id);
    await send_verification_email(user?.emailAddress, token);
  }

  return true;
};

export default send_email_verification;

