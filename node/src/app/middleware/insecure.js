export default (req, res, next) => {
  if (process.env.NODE_ENV != 'development' && !req.secure) {
    return res.redirect("https://" + req.headers.host + req.url);
  }

  next();
};
