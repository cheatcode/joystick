import dayjs from "dayjs";
var setCookie_default = (res = {}, cookieName = "", cookieValue = "", expiresAt = null) => {
  if (!res || !cookieName)
    return null;
  const cookieOptions = {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true
  };
  if (expiresAt) {
    cookieOptions.expires = dayjs(expiresAt).toDate();
  }
  res.cookie(cookieName, cookieValue, cookieOptions);
};
export {
  setCookie_default as default
};
