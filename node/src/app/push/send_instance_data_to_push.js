import https from 'https';
import { URL } from 'url';
import load_settings from '../../app/settings/load.js';

const send_instance_data_to_push = async (type = '', data = '') => {
  const settings = load_settings();
  const base_url = settings?.private?.cheatcode?.push_debug_url || 'https://push.cheatcode.co';
  const url = `${base_url}/api/instances/${type}`;
  const parsed_url = new URL(url);

  const head_options = {
    method: 'HEAD',
    hostname: parsed_url.hostname,
    port: parsed_url.port || 443,
    path: parsed_url.pathname,
    headers: {}
  };

  const head_ok = await new Promise((resolve) => {
    const req = https.request(head_options, (res) => {
      console.log('HEAD response received:', {
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400,
        statusText: res.statusMessage
      });
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.on('error', (err) => {
      console.error('HEAD request error:', err);
      resolve(false);
    });

    req.end();
  });

  if (!head_ok) {
    return; // NOTE: Do nothing because Push isn't available.
  }

  const body = JSON.stringify({ type, data });

  const post_options = {
    method: 'POST',
    hostname: parsed_url.hostname,
    port: parsed_url.port || 443,
    path: parsed_url.pathname,
    headers: {
      'x-push-instance-token': process.env.PUSH_INSTANCE_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(post_options, (res) => {
      let response_data = '';

      res.on('data', (chunk) => {
        response_data += chunk;
      });

      res.on('end', () => {
        console.log('POST response received:', {
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          statusText: res.statusMessage
        });

        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(response_data);
        } else {
          resolve(); // Fail silently
        }
      });
    });

    req.on('error', (err) => {
      console.error('POST request error:', err);
      resolve(); // Fail silently
    });

    req.write(body);
    req.end();
  });
};

export default send_instance_data_to_push;

// import load_settings from '../../app/settings/load.js';
// import fetch from 'node-fetch';

// const send_instance_data_to_push = async (type = '', data = '') => {
//   const settings = load_settings();
//   const url = `${settings?.private?.cheatcode?.push_debug_url || 'https://push.cheatcode.co'}/api/instances/${type}`;

//   const check_response = await fetch(url, { method: 'HEAD' });

//   console.log('HEAD response received:', {
//     url,
//     status: check_response.status,
//     ok: check_response.ok,
//     statusText: check_response.statusText
//   });

//   if (!check_response.ok) {
//     return; // NOTE: Do nothing because Push isn't available.
//   }

//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'x-push-instance-token': process.env.PUSH_INSTANCE_TOKEN,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ type, data }),
//   });

//   console.log('POST response received:', {
//     status: response.status,
//     ok: response.ok,
//     statusText: response.statusText
//   });
  
//   if (!response.ok) {
//     return; // NOTE: Fail silently because Push had an error.
//   }

//   return response;
// };

// export default send_instance_data_to_push;