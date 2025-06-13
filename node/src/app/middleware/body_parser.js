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

    // NOTE: Use this approach as some requests with this content-type will include
    // the charset alongside the MIME-type (e.g., AWS does stuff like "text/plain; charset=UTF-8").
    if (content_type.startsWith("text/plain")) {
      return express.text()(req, res, next);
    }    

    return express.json(config?.json)(req, res, next);
  };
};

export default body_parser;
