import generate_insecure_page from './generate_insecure_page.js';

const insecure_middleware = (req, res, next) => {
  /*
    NOTE:

    This middleware solves two problems:

    1. We're redirecting to or directly accessing an instance that *will* have https but doesn't yet.
    2. The server has SSL set up properly, but a user typed in http and we want to redirect them.

    In both cases, we want to render a warning and then after 15 seconds, redirect the user to HTTPS.
  */

  // NOTE: Make any _push related URLs exempt from this check (e.g., health checks).
  if (req.url.includes('/_push')) {
    return next();
  }

  if (!req.secure) {
    return res.send(generate_insecure_page(req?.headers?.host, req?.url));
  }

  next();
};

export default insecure_middleware;
