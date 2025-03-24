import load_settings from '../../app/settings/load.js';
import fetch from 'node-fetch';

const send_instance_data_to_push = async (type = '', data = '') => {
  const settings = load_settings();
  const url = `${settings?.private?.cheatcode?.push_debug_url || 'https://push.cheatcode.co'}/api/instances/${type}`;

  const check_response = await fetch(url, { method: 'HEAD' });

  console.log({
    check_response,
  });

  if (!check_response.ok) {
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
    return; // NOTE: Fail silently because Push had an error.
  }

  return response;
};

export default send_instance_data_to_push;