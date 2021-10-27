import express from "express";
var bodyParser_default = (config = {}) => {
  return (req, res, next) => {
    const contentType = req.headers["content-type"];
    if (contentType && contentType === "application/x-www-form-urlencoded") {
      return express.urlencoded({
        extended: true,
        ...config?.urlencoded || {}
      })(req, res, next);
    }
    return express.json(config?.json)(req, res, next);
  };
};
export {
  bodyParser_default as default
};
