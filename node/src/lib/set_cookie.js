const set_cookie = (res = {}, options = {}, cookie_name = '', cookie_value = '', expires_at = null) => {
  if (!res || !options?.name) return null;

  const cookie_options = {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: options?.http_only,
  };
  
  if (options?.expires_at) {
    cookie_options.expires = new Date(options?.expires_at);
  }
  
  res.cookie(options?.name, options?.value, cookie_options);
};

export default set_cookie;
