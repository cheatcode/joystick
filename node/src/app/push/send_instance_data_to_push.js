import https from 'https';
import { URL } from 'url';
import load_settings from '../../app/settings/load.js';

const send_instance_data_to_push = async (type = '', data = '') => {
  const settings = load_settings();
  const base_url = settings?.private?.cheatcode?.push_debug_url || 'https://push.cheatcode.co';
  const url = `${base_url}/api/instances/${type}`;
  const parsed_url = new URL(url);

  const post_body = JSON.stringify({ type, data });

  return new Promise((resolve) => {
    const req = https.request({
      method: 'POST',
      hostname: parsed_url.hostname,
      port: parsed_url.port || 443,
      path: parsed_url.pathname,
      headers: {
        'x-push-instance-data': true,
        'x-push-instance-token': process.env.PUSH_INSTANCE_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(post_body)
      },
      timeout: 5000
    }, (res) => {
      let response_data = '';

      res.on('data', (chunk) => {
        response_data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(response_data);
        } else {
          resolve();
        }
      });
    });

    req.on('error', (err) => {
      console.log('send_instance_data_to_push POST error', err);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      resolve();
    });

    req.write(post_body);
    req.end();
  });
};

export default send_instance_data_to_push;
