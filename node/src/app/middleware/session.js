import setCookie from "../../lib/setCookie.js";
import runSessionQuery from "../runSessionQuery.js";

export default async (req, res, next) => {
  let session_id = req?.cookies?.joystickSession;

  const existing_session = session_id ? await runSessionQuery('get_session', {
    session_id,
  }) : null;

  // NOTE: If cookie didn't exist, generate a fresh session and add it to the
  // sessions database along with a new CSRF token.
  if (!existing_session) {
    session_id = await runSessionQuery('create_session');
    setCookie(res, 'joystickSession', session_id);
  }
  
  req.cookies = {
    ...(req?.cookies || {}),
    joystickSession: session_id,
  }
  
  req.context = {
    ...(req?.context || {}),
    session: await runSessionQuery('get_session', { session_id }),
  };
  
  next();
};