import dayjs from "dayjs";
var generateCookie_default = (tokenExpiresAt = null) => {
  const cookie = {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true
  };
  if (tokenExpiresAt) {
    cookie.expires = dayjs(tokenExpiresAt).toDate();
  }
  return cookie;
};
export {
  generateCookie_default as default
};
