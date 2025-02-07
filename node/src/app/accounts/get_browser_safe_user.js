import types from "../../lib/types.js";

const get_browser_safe_user = (user = null) => {
  if (!user || !types.is_object(user)) {
    return null;
  }

  const unsafe_fields = [
    'password',
    'passwordResetTokens',
    'sessions',
    'oauth',
    'verifyEmailTokens',
  ];

  const browser_safe_user = Object.entries(user || {}).filter(([field]) => {
    return !unsafe_fields.includes(field);
  }).reduce((fields, [field, value]) => {
    if (!fields[field]) {
    	fields[field] = value;
    }
    
    return fields;
  }, {});

  return {
    ...browser_safe_user,
    email_address: browser_safe_user?.emailAddress,
  };
};

export default get_browser_safe_user;
