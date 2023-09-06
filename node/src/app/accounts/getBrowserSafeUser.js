import { isObject } from "../../validation/lib/typeValidators";
import escapeKeyValuePair from "../../lib/escapeKeyValuePair.js";

export default (user = null) => {
  if (!user || !isObject(user)) {
    return null;
  }

  const unsafeFields = [
    'password',
    'passwordResetTokens',
    'sessions',
    'oauth',
  ];

  const browserSafeUser = Object.entries(user).filter(([field]) => {
    return !unsafeFields.includes(field);
  }).reduce((fields, [field, value]) => {
    if (!fields[field]) {
      fields[field] = value;
      return fields;
    }
  }, {});

  return escapeKeyValuePair(browserSafeUser);
};