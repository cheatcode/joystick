import setCookie from "../../lib/setCookie.js";
import generateId from "../../lib/generateId.js";
var session_default = (req, res, next, appInstance = {}) => {
  let sessionId = req?.cookies?.joystickSession;
  if (!sessionId) {
    sessionId = generateId(32);
    setCookie(res, "joystickSession", sessionId);
  }
  if (!appInstance.sessions.get(sessionId)) {
    appInstance.sessions.set(sessionId, { id: sessionId, csrf: generateId(32) });
  }
  req.cookies = {
    ...req?.cookies || {},
    joystickSession: sessionId
  };
  req.context = {
    ...req?.context || {},
    session: appInstance?.sessions?.get(sessionId)
  };
  next();
};
export {
  session_default as default
};
