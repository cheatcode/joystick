import generateCookie from "../../lib/generateCookie.js";

export default (res = null, authentication = null) => {
  if (!res || !authentication) return null;

  res.cookie(
    "joystickLoginToken",
    authentication.token,
    generateCookie(authentication.tokenExpiresAt)
  );

  res.cookie(
    "joystickLoginTokenExpiresAt",
    authentication.tokenExpiresAt,
    generateCookie(authentication.tokenExpiresAt)
  );

  return res;
};
