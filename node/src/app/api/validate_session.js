import run_session_query from "../databases/queries/sessions.js";

const validate_session = async (req = null, res = null) => {
  const csrf_token = req?.headers['x-joystick-csrf'];
  const session = await run_session_query('get_session', {
    session_id: req?.cookies?.joystick_session,
  });

  if (csrf_token === 'joystick_test' && process.env.NODE_ENV === 'test') {
    return true;
  }

  if (!session || session && session.csrf !== csrf_token) {
    return false;
  }
  
  return true;
};

export default validate_session;
