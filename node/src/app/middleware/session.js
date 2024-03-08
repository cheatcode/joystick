import sessions_query from "../databases/queries/sessions.js";
import set_cookie from '../../lib/set_cookie.js';

const session_middleware = async (req, res, next) => {
  let session_id = req?.cookies?.joystick_session;

  const existing_session = session_id ? await sessions_query('get_session', {
    session_id,
  }) : null;

  // NOTE: If cookie didn't exist, generate a fresh session and add it to the
  // sessions database along with a new CSRF token.
  if (!existing_session) {
    session_id = await sessions_query('create_session');
    set_cookie(res, 'joystick_session', session_id);
  }
  
  req.cookies = {
    ...(req?.cookies || {}),
    joystick_session: session_id,
  }
  
  req.context = {
    ...(req?.context || {}),
    session: await sessions_query('get_session', { session_id }),
  };
  
  next();
};

export default session_middleware;
