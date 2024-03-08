const has_login_token_expired = (res, token = null, token_expires_at = null) => {
  if (!token || !token_expires_at) {
    return true;
  }

  return new Date(token_expires_at) <= new Date();
};

export default has_login_token_expired;
