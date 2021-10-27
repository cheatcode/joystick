import dayjs from "dayjs";
var getBaseAuthenticationCookie_default = (tokenExpiresAt = null) => {
  return {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    expires: dayjs(tokenExpiresAt).toDate()
  };
};
export {
  getBaseAuthenticationCookie_default as default
};
