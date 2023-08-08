import dayjs from "dayjs";
import unsetAuthenticationCookie from "./unsetAuthenticationCookie";

export default async (res, token = null, tokenExpiresAt = null) => {
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
