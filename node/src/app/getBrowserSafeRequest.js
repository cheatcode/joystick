import getBrowserSafeUser from './accounts/getBrowserSafeUser';
import escapeKeyValuePair from "../lib/escapeKeyValuePair.js";

export default (req = {}) => {
  const browserSafeRequest = {};

  browserSafeRequest.params = escapeKeyValuePair(req.params);
  browserSafeRequest.query = escapeKeyValuePair(req.query);
  browserSafeRequest.context = {
    user: getBrowserSafeUser(req.context.user)
  };

  return browserSafeRequest;
};