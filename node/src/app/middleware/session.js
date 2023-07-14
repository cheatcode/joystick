import setCookie from "../../lib/setCookie.js";
import generateId from "../../lib/generateId.js";

export default (req, res, next, appInstance = {}) => {
  // NOTE: Check if we have a joystickSession ID in the cookies and if we don't,
  // generate one and assign it to the request.
  
  let sessionId = req?.cookies?.joystickSession;
  
  // NOTE: If cookie didn't exist or it has expired, generate a fresh session and add it to the
  // sessions array on the app instance.
  if (!sessionId) {
    sessionId = generateId(32);
    setCookie(res, 'joystickSession', sessionId);
  }
  
  if (!appInstance.sessions.get(sessionId)) {
    appInstance.sessions.set(sessionId, { id: sessionId, csrf: generateId(32) });
  }

  req.cookies = {
    ...(req?.cookies || {}),
    joystickSession: sessionId,
  }
  
  req.context = {
    ...(req?.context || {}),
    session: appInstance?.sessions?.get(sessionId),
  };
  
  next();
};