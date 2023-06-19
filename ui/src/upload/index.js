import generateId from "../lib/generateId";
import logRequestErrors from "../lib/logRequestErrors";
import throwFrameworkError from "../lib/throwFrameworkError";
import websocketClient from "../websockets/client";

export default (uploaderName = '', uploaderOptions = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadId = generateId();
      let lastProgress = 0;
  
      websocketClient({
        url: `${window?.process?.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${location.host}/api/_websockets/uploaders`,
        options: {
          logging: process.env.NODE_ENV === 'development',
          autoReconnect: true,
          reconnectAttempts: 12,
          reconnectDelayInSeconds: 5,
        },
        query: {
          id: uploadId,
        },
        events: {
          onMessage: (message = {}) => {
            if (message?.type === 'PROGRESS' && uploaderOptions?.onProgress && lastProgress < 100 && lastProgress !== message?.progress) {
              lastProgress = message?.progress;
              uploaderOptions.onProgress(message?.progress, message?.provider);
            }
          },
        },
      }, () => {
        let formData;
  
        if (uploaderOptions?.files?.length > 0) {
          formData = new FormData();
  
          Array.from(uploaderOptions?.files).forEach((file) => {
            formData.append('files', file, file.name);
          });
        }

        fetch(`${window.location.origin}/api/_uploaders/${uploaderName}`, {
          method: 'POST',
          headers: {
            'x-joystick-upload-id': uploadId,
            'x-joystick-upload-input': JSON.stringify(uploaderOptions?.input || {}),
          },
          body: formData,
        }).then(async (data) => {
          const response = await data.json();
          console.log(response);
          
          if (response && response.errors) {
            logRequestErrors('upload', response.errors);
            reject({ errors: response.errors });
          } else {
            resolve(response?.uploads);
          }
        });
      });
    });
  } catch (exception) {
    throwFrameworkError('upload', exception);
  }
};