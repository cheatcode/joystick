var parseCookiesFromLogin_default = (response = {}) => {
  const cookiesToSet = response?.headers.get("set-cookie");
  const cookies = cookiesToSet.split(";").map((value) => value.split("=")).filter(([key, value]) => {
    return (key === " HttpOnly, joystickLoginTokenExpiresAt" || key === " HttpOnly, joystickLoginToken") && !value.includes("null");
  }).reduce((parsedCookies = {}, [key, value]) => {
    if (key.trim() === "HttpOnly, joystickLoginToken") {
      parsedCookies["joystickLoginToken"] = value;
    }
    if (key.trim() === "HttpOnly, joystickLoginTokenExpiresAt") {
      parsedCookies["joystickLoginTokenExpiresAt"] = value;
    }
    return parsedCookies;
  }, {});
  return cookies;
};
export {
  parseCookiesFromLogin_default as default
};
