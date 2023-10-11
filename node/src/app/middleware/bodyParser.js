import express from "express";

export default (config = {}) => {
  return (req, res, next) => {
    const contentType = req.headers["content-type"];

    // TODO: Document that you need to pass either urlencoded or json under the
    // bodyParser config. Else this doesn't take.

    // TODO: Should be able to support any content type. Get a list of all possibilities
    // and then map the config properly.

    if (contentType && contentType === "application/x-www-form-urlencoded") {
      return express.urlencoded({
        extended: true,
        ...(config?.urlencoded || {}),
      })(req, res, next);
    }

    return express.json(config?.json)(req, res, next);
  };
};
