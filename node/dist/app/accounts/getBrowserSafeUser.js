import { isObject } from "../../validation/lib/typeValidators";
import escapeKeyValuePair from "../../lib/escapeKeyValuePair.js";
var getBrowserSafeUser_default = (user = null) => {
  if (!user || !isObject(user)) {
    return null;
  }
  const unsafeFields = [
    "password",
    "passwordResetTokens",
    "sessions",
    "oauth",
    "verifyEmailTokens"
  ];
  const browserSafeUser = Object.entries(user || {}).filter(([field]) => {
    return !unsafeFields.includes(field);
  }).reduce((fields, [field, value]) => {
    if (!fields[field]) {
      fields[field] = value;
      return fields;
    }
  }, {});
  return browserSafeUser;
};
export {
  getBrowserSafeUser_default as default
};
