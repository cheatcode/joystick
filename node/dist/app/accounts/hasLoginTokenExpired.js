import dayjs from "dayjs";
import unsetAuthenticationCookie from "./unsetAuthenticationCookie";
var hasLoginTokenExpired_default = async (res, token = null, tokenExpiresAt = null) => {
  if (!token || !tokenExpiresAt) {
    unsetAuthenticationCookie(res);
    return true;
  }
  const hasExpired = dayjs().isAfter(dayjs(tokenExpiresAt));
  if (hasExpired) {
    unsetAuthenticationCookie(res);
    return true;
  }
  return false;
};
export {
  hasLoginTokenExpired_default as default
};
