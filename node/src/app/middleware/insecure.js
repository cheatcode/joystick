export default (req, res, next) => {
  // NOTE: Check the x-forwarded-proto call to see if this request was made
  // via HTTPS where the SSL was terminated at a load balancer.
  const forwardedProtocol = req.get("x-forwarded-proto");
  const isForwardedFromHTTPS = forwardedProtocol && forwardedProtocol === 'https';
  
  if (process.env.NODE_ENV != 'development' && !req.secure && !isForwardedFromHTTPS) {
    return res.redirect("https://" + req.headers.host + req.url);
  }

  next();
};
