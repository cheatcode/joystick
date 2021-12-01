import dayjs from "dayjs";
import unsetAuthenticationCookie from "./unsetAuthenticationCookie";
import _dayjs from '../../tests/mocks/dayjs';

export default (res, token = null, tokenExpiresAt = null) => {
  if (!token || !tokenExpiresAt) {
    unsetAuthenticationCookie(res);
    return true;
  }

  // NOTE: If we're in a test, make sure we use the actual dayjs() constructor here
  // as our test mock overrides the date breaking this code.
  const hasExpired = process.env.NODE_ENV === 'test' ? _dayjs().isAfter(_dayjs(tokenExpiresAt)) : dayjs().isAfter(dayjs(tokenExpiresAt));

  if (hasExpired) {
    unsetAuthenticationCookie(res);
    return true;
  }

  return false;
};
