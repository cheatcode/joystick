import crypto from 'crypto';
import set_cookie from '../../lib/set_cookie.js';
import generate_id from '../../lib/generate_id.js';
import load_settings from '../settings/load.js';

const settings = load_settings();

const COOKIE_NAME = 'joystick_session';
const SESSION_SECRET = settings?.config?.sessions?.secret || null;

const sign_data = (data) => {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64');
  return `${payload}.${signature}`;
};

const verify_and_parse = (signed_data) => {
  if (!signed_data) return null;
  
  const [payload, signature] = signed_data.split('.');
  if (!payload || !signature) return null;
  
  const expected_signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64');
  
  if (signature !== expected_signature) return null;
  
  try {
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
};

const cookie_session_middleware = (req, res, next) => {
  if (SESSION_SECRET) {
    const push_instance_token = req?.headers?.['x-push-instance-token'];

    if (push_instance_token) {
      if (settings?.private?.cheatcode?.is_push) {
        return next();
      }
    }

    if (req?.url?.includes('/api/_push/health')) {
      return next();
    }

    const existing_session_cookie = req?.cookies?.[COOKIE_NAME];
    let session_data = verify_and_parse(existing_session_cookie);

    if (!session_data) {
      const session_id = generate_id(16);
      session_data = {
        _id: session_id,
        csrf: generate_id(32),
        created_at: new Date()
      };
      
      const signed_session = sign_data(session_data);
      
      set_cookie(res, {
        name: COOKIE_NAME,
        value: signed_session,
        http_only: true,
        max_age: 30 * 24 * 60 * 60 * 1000,
        same_site: 'lax'
      });
    }

    req.cookies = {
      ...(req?.cookies || {}),
      [COOKIE_NAME]: session_data._id
    };

    req.context = {
      ...(req?.context || {}),
      session: session_data
    };
  }

  next();
};

export default cookie_session_middleware;
