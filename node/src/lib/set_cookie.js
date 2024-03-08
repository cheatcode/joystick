const set_cookie = (res = {}, cookie_name = '', cookie_value = '', expires_at = null) => {
  if (!res || !cookie_name) return null;

  const cookie_options = {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
  };
  
  if (expires_at) {
    cookie_options.expires = new Date(expires_at);
  }
  
  res.cookie(cookie_name, cookie_value, cookie_options);
};

export default set_cookie;
