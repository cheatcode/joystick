import get_insecure_landing_page_html from './get_insecure_landing_page_html.js';

export default (req, res, next) => {
  /*
    NOTE:

    This middleware solves two problems:

    1. We're redirecting to or directly accessing an instance that *will* have https but doesn't yet.
    2. The server has SSL set up properly, but a user typed in http and we want to redirect them.

    In both cases, we want to render a warning and then after 15 seconds, redirect the user to HTTPS.
  */

  if (!req.secure) {
    return res.send(get_insecure_landing_page_html(req?.headers?.host, req?.url));
  }

  next();
};
