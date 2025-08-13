import fetch, { FormData } from 'node-fetch';
import generate_cookie_header from '../../lib/generate_cookie_header.js';
import get_test_port from '../../lib/get_test_port.js';

const upload = (uploader_name = '', uploader_options = {}) => {
  return new Promise(async (resolve, reject) => {
    let form_data;

    if (uploader_options?.files?.length > 0) {
      form_data = new FormData();
      const files = Array.from(uploader_options?.files);

      for (let i = 0; i < files?.length; i += 1) {
        const file = files[i];
        form_data.append('files', file, file.name);
      }

      const headers = {
        'x-joystick-upload-id': 'joystick_test',
        'x-joystick-upload-input': JSON.stringify(uploader_options?.input || {}),
      };

      if (uploader_options?.user) {
        headers.Cookie = generate_cookie_header({
          joystick_login_token: uploader_options?.user?.joystick_login_token,
          joystick_login_token_expires_at: uploader_options?.user?.joystick_login_token_expires_at,
        }); 
      }

      fetch(`http://localhost:${get_test_port()}/api/_uploaders/${uploader_name}`, {
        method: 'POST',
        headers,
        body: form_data,
      }).then(async (data) => {
        const response = await data.json();

        if (response && response.errors) {
          reject({ errors: response.errors });
        } else {
          resolve(response?.uploads);
        }
      });
    }
  });
};

export default upload;
