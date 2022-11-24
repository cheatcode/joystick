import getBrowserSafeUser from "./accounts/getBrowserSafeUser";
var getBrowserSafeRequest_default = (req = {}) => {
  const browserSafeRequest = {};
  browserSafeRequest.params = req.params;
  browserSafeRequest.query = req.query;
  browserSafeRequest.context = {
    user: getBrowserSafeUser(req.context.user)
  };
  return browserSafeRequest;
};
export {
  getBrowserSafeRequest_default as default
};
