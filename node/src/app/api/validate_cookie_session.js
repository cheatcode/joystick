const validate_cookie_session = async (req = null, res = null) => {
  const session = req?.context?.session;

  console.log('validate_session_cookie', session);

  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  // NOTE: If session exists, it means the signed cookie was valid
  // (signature was verified in cookie_session_middleware)
  if (!session || !session.csrf) {
    return false;
  }
  
  return true;
};

export default validate_cookie_session;
