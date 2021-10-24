import express from "express";

export default (config = {}) => {
  return (req, res, next) => {
    const contentType = req.headers["content-type"];

    if (contentType && contentType === "application/x-www-form-urlencoded") {
      return express.urlencoded({
        extended: true,
        ...(config?.urlencoded || {}),
      })(req, res, next);
    }

    return express.json(config?.json)(req, res, next);
  };
};
