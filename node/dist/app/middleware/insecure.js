var insecure_default = (req, res, next) => {
  const forwardedProtocol = req.get("x-forwarded-proto");
  const isForwardedFromHTTPS = forwardedProtocol && forwardedProtocol === "https";
  if (process.env.NODE_ENV != "development" && !req.secure && !isForwardedFromHTTPS) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
};
export {
  insecure_default as default
};
