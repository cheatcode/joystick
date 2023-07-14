import formatAPIError from "../lib/formatAPIError.js";

export default (req = null, res = null, sessions = null) => {
  const sessionToken = req?.cookies?.joystickSession;
  const csrfToken = req?.headers['x-joystick-csrf'];
  const session = sessions?.get(sessionToken);

  if (!session || session && session.csrf !== csrfToken) {
    res.status(403).send(
      JSON.stringify({
        errors: [formatAPIError(new Error('Unauthorized request.'))],
      })
    );
    
    return false;
  }
  
  return true;
};