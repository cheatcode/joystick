import express from "express";

const body_parser = (config = {}) => {
  return (req, res, next) => {
    const content_type = req.headers["content-type"];

    if (content_type && content_type === "application/x-www-form-urlencoded") {
      return express.urlencoded({
        extended: true,
        ...(config?.urlencoded || {}),
      })(req, res, next);
    }

    if (content_type === "text/plain") {
      return express.text()(req, res, next);
    }    

    return express.json(config?.json)(req, res, next);
  };
};

export default body_parser;
