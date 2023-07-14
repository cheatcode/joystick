import dayjs from "dayjs";
var unsetCookie_default = (cookieName = "", res = {}) => {
  if (!cookieName || !res)
    return null;
  res.cookie(cookieName, null, {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    expires: dayjs().toDate()
  });
};
export {
  unsetCookie_default as default
};
