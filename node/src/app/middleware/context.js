const if_logged_in = (redirect_path = "", callback = null, http = {}) => {
  if (!!http?.req?.context?.user && redirect_path) {
    return http?.res.redirect(redirect_path);
  }

  if (callback) {
    return callback();
  }
};

const if_not_logged_in = (redirect_path = "", callback = null, http = {}) => {
  if (!http?.req?.context?.user && redirect_path) {
    return http?.res.redirect(redirect_path);
  }

  if (callback) {
    return callback();
  }
};

const context_middleware = async (req, res, next) => {
  req.context = {
    ...(req?.context || {}),
    redirect: res.redirect,
    if_logged_in: (redirect_path = '', callback) => if_logged_in(redirect_path, callback, { req, res }),
	  ifLoggedIn: (redirect_path = '', callback) => if_logged_in(redirect_path, callback, { req, res }),
	  if_not_logged_in: (redirect_path = '', callback) => if_not_logged_in(redirect_path, callback, { req, res }),
	  ifNotLoggedIn: (redirect_path = '', callback) => if_not_logged_in(redirect_path, callback, { req, res }),
	  ...(process.databases || {}),
  };

  next();
};

export default context_middleware;
