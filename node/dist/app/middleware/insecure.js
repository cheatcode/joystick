import get_insecure_landing_page_html from "./get_insecure_landing_page_html.js";
var insecure_default = (req, res, next) => {
  if (!req.secure) {
    return res.send(get_insecure_landing_page_html(req?.headers?.host, req?.url));
  }
  next();
};
export {
  insecure_default as default
};
