import getBaseAuthenticationCookie from "./getBaseAuthenticationCookie";

export default (res = null, authentication = null) => {
  if (!res || !authentication) return null;

  console.log(
    "joystickLoginToken",
    authentication.token,
    getBaseAuthenticationCookie(authentication.tokenExpiresAt)
  );

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
