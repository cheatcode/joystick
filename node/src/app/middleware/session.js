import sessions_query from "../databases/queries/sessions.js";
import set_cookie from '../../lib/set_cookie.js';
import load_settings from "../settings/load.js";

const session_middleware = async (req, res, next) => {
  const push_instance_token = req?.headers?.['x-push-instance-token'];

  if (push_instance_token) {
    const settings = load_settings();

    if (settings?.private?.cheatcode?.is_push) {
      // NOTE: Only run this if the app has signaled that it's Push. If it is, we can
      // trust we have access to the database and can verify the inbound token.
      const instance = await process.databases.mongodb.collection('instances').findOne({
        token: { $eq: push_instance_token },
      });

      if (!!instance) {
        return next();
      }
    }
  }

  if (req?.url?.includes('/api/_push/health')) {
    // NOTE: We know this is a health check from Push which doesn't require a
    // session to be created.
    return next();
  }

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
