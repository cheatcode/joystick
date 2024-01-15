import setCookie from "../../lib/setCookie.js";
import runSessionQuery from "../runSessionQuery.js";
var session_default = async (req, res, next) => {
  let session_id = req?.cookies?.joystickSession;
  const existing_session = session_id ? await runSessionQuery("get_session", {
    session_id
  }) : null;
  if (!existing_session) {
    session_id = await runSessionQuery("create_session");
    setCookie(res, "joystickSession", session_id);
  }
  req.cookies = {
    ...req?.cookies || {},
    joystickSession: session_id
  };
  req.context = {
    ...req?.context || {},
    session: await runSessionQuery("get_session", { session_id })
  };
  next();
};
export {
  session_default as default
};
