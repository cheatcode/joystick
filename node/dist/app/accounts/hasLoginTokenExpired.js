import dayjs from "dayjs";
import unsetAuthenticationCookie from "./unsetAuthenticationCookie";
var hasLoginTokenExpired_default = async (res, token = null, tokenExpiresAt = null) => {
  if (!token || !tokenExpiresAt) {
    unsetAuthenticationCookie(res);
    return true;
  }
  const _dayjs = process.env.NODE_ENV === "test" ? (await import("../../tests/mocks/dayjs")).default : null;
  const hasExpired = process.env.NODE_ENV === "test" ? _dayjs().isAfter(_dayjs(tokenExpiresAt)) : dayjs().isAfter(dayjs(tokenExpiresAt));
  if (hasExpired) {
    unsetAuthenticationCookie(res);
    return true;
  }
  return false;
};
export {
  hasLoginTokenExpired_default as default
};
