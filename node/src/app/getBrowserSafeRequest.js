import getBrowserSafeUser from './accounts/getBrowserSafeUser';

export default (req = {}) => {
  const browserSafeRequest = {};

  browserSafeRequest.params = req.params;
  browserSafeRequest.query = req.query;
  browserSafeRequest.context = {
    user: getBrowserSafeUser(req.context.user)
  };

  return browserSafeRequest;
};