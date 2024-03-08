import generate_id from "../lib/generate_id.js";
import log_request_errors from "../lib/log_request_errors.js";
import track_function_call from "../test/track_function_call.js";
import websocket_client from "../websockets/client.js";

export default (uploader_name = '', uploader_options = {}) => {
  if (window?.__joystick_test__) {
    // NOTE: In a test, do not try to upload anything, just track the call and return.
    track_function_call(`ui.upload.${uploader_name}`, [
      uploader_name,
      uploader_options,
    ]);

    return;
  }

  return new Promise((resolve, reject) => {
    const upload_id = generate_id(16);
    let last_progress = 0;

    websocket_client({
      url: `${window?.process?.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${location.host}/api/_websockets/uploaders`,
      options: {
        logging: process.env.NODE_ENV === 'development',
        autoReconnect: true,
        reconnectAttempts: 12,
        reconnectDelayInSeconds: 5,
      },
      query: {
        id: upload_id,
      },
      events: {
        on_message: (message = {}) => {
          if (message?.type === 'PROGRESS' && (uploader_options?.onProgress || uploader_options?.on_progress) && last_progress < 100 && last_progress !== message?.progress) {
            last_progress = message?.progress;
            (uploader_options.onProgress || uploader_options?.on_progress)(message?.progress, message?.provider);
          }
        },
      },
    }, () => {
      let formData;

      if (uploader_options?.files?.length > 0) {
        formData = new FormData();
        const files = Array.from(uploader_options?.files);

        for (let i = 0; i < files?.length; i += 1) {
          const file = files[i];
          formData.append('files', file, file.name);
        }
      }

      fetch(`${window.location.origin}/api/_uploaders/${uploader_name}`, {
        method: 'POST',
        headers: {
          'x-joystick-upload-id': upload_id,
          'x-joystick-upload-input': JSON.stringify(uploader_options?.input || {}),
        },
        body: formData,
      }).then(async (data) => {
        const response = await data.json();

        if (response && response.errors) {
          log_request_errors('upload', response.errors);
          reject({ errors: response.errors });
        } else {
          resolve(response?.uploads);
        }
      });
    });
  });
};