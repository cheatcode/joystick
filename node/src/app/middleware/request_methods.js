const request_methods_middleware = (req, res, next) => {
  // NOTE: Exclude TRACE and TRACK methods to avoid XST attacks.
  const allowed_methods = [
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ];

  if (!allowed_methods.includes(req.method)) {
    res.status(405).send(`${req.method} not allowed.`);
  }

  next();
};

export default request_methods_middleware;
