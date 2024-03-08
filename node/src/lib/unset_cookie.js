const unset_cookie = (cookie_name = '', res = {}) => {
  if (!cookie_name || !res) return null;
  
  res.cookie(cookie_name, null, {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    expires: new Date(),
  });
};

export default unset_cookie;
