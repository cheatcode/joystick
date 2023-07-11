var insecure_default = (req, res, next) => {
  if (process.env.NODE_ENV != "development" && !req.secure) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
};
export {
  insecure_default as default
};
