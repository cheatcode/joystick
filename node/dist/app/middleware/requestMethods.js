var requestMethods_default = (req, res, next) => {
  const allowedMethods = [
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH"
  ];
  if (!allowedMethods.includes(req.method)) {
    res.status(405).send(`${req.method} not allowed.`);
  }
  next();
};
export {
  requestMethods_default as default
};
