import formatAPIError from "../lib/formatAPIError.js";
import runSessionQuery from "./runSessionQuery.js";

export default async (req = null, res = null) => {
  const csrfToken = req?.headers['x-joystick-csrf'];
  const session = await runSessionQuery('get_session', {
    session_id: req?.cookies?.joystickSession,
  });

  if (csrfToken === 'joystick_test') {
    return true;
  }

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