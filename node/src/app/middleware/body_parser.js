import express from "express";

const body_parser = (config = {}) => {
  return (req, res, next) => {
    const content_Type = req.headers["content-type"];

    if (content_Type && content_Type === "application/x-www-form-urlencoded") {
      return express.urlencoded({
        extended: true,
        ...(config?.urlencoded || {}),
      })(req, res, next);
    }

    return express.json(config?.json)(req, res, next);
  };
};

export default body_parser;
