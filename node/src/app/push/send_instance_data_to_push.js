import load_settings from '../../app/settings/load.js';
import fetch from 'node-fetch';

const send_instance_data_to_push = async (type = '', data = '') => {
  const settings = load_settings();
  const url = `${settings?.private?.cheatcode?.push_debug_url || 'https://push.cheatcode.co'}/api/instances/${type}`;

  const check_response = await fetch(url, { method: 'HEAD' });

  console.log({
    url,
    status: check_response.status,
    ok: check_response.ok,
    statusText: check_response.statusText
  });

  if (!check_response.ok) {
    console.log('CHECK RESPONSE NOT OKAY, PUSH NOT AVAILABLE.');
    return; // NOTE: Do nothing because Push isn't available.
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-push-instance-token': process.env.PUSH_INSTANCE_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, data }),
  });

  if (!response.ok) {
    try {
      // Try to parse the response as JSON to get the error message
      const error_data = await response.json();
      console.log('Push server error:', {
        status: response.status,
        statusText: response.statusText,
        error: error_data
      });
    } catch (e) {
      // If the response isn't JSON or can't be parsed
      const error_text = await response.text();
      console.log('Push server error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: error_text
      });
    }    
    return; // NOTE: Fail silently because Push had an error.
  }

  return response;
};

export default send_instance_data_to_push;