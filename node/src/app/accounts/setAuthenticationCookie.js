import getBaseAuthenticationCookie from "./getBaseAuthenticationCookie";

export default (res = null, authentication = null) => {
  if (!res || !authentication) return null;

  res.cookie(
    "joystickLoginToken",
    authentication.token,
    getBaseAuthenticationCookie(authentication.tokenExpiresAt)
  );

  res.cookie(
    "joystickLoginTokenExpiresAt",
    authentication.tokenExpiresAt,
    getBaseAuthenticationCookie(authentication.tokenExpiresAt)
  );

  return res;
};
