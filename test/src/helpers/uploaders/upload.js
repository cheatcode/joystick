import fetch, { FormData } from 'node-fetch';
import logRequestErrors from "../../lib/logRequestErrors.js";

export default (uploaderName = '', uploaderOptions = {}) => {
  return new Promise(async (resolve, reject) => {
    let formData;

    if (uploaderOptions?.files?.length > 0) {
      formData = new FormData();
      const files = Array.from(uploaderOptions?.files);

      for (let i = 0; i < files?.length; i += 1) {
        const file = files[i];
        formData.append('files', file, file.name);
      }

      fetch(`http://localhost:${process.env.PORT}/api/_uploaders/${uploaderName}`, {
        method: 'POST',
        headers: {
          'x-joystick-upload-id': 'joystick_test',
          'x-joystick-upload-input': JSON.stringify(uploaderOptions?.input || {}),
        },
        body: formData,
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