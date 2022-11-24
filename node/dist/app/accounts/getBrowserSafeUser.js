import { isObject } from "../../validation/lib/typeValidators";
var getBrowserSafeUser_default = (user = null) => {
  if (!user || !isObject(user)) {
    return null;
  }
  const unsafeFields = [
    "password",
    "sessions"
  ];
  const browserSafeUser = Object.entries(user).filter(([field]) => {
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
