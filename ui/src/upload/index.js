import generateId from "../utils/generateId";
import logRequestErrors from "../utils/logRequestErrors";
import websocketClient from "../websockets/client";

export default (uploaderName = '', uploaderOptions = {}) => {
  return new Promise((resolve, reject) => {
    const uploadId = generateId();
    let lastProgress = 0;

    websocketClient({
      url: `${window?.process?.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${location.host}/api/_websockets/uploaders`,
      queryParams: {
        id: uploadId,
      },
      onMessage: (message = {}) => {
        if (message?.type === 'PROGRESS' && uploaderOptions?.onProgress && lastProgress !== message?.progress) {
          lastProgress = message?.progress;
          uploaderOptions.onProgress(message?.progress, message?.provider);
        }
      },
    }, () => {
      let formData;

      if (uploaderOptions?.files?.length > 0) {
        formData = new FormData();

        Array.from(uploaderOptions?.files).forEach((file) => {
          formData.append('files', file, file.name);
        });
      }
    
      const request = new XMLHttpRequest();

      request.onload = () => {
        const response = request.responseText ? JSON.parse(request.responseText) : null;
        if (response && response.errors) {
          logRequestErrors('upload', response.errors);
          reject(response.errors);
        } else {
          resolve(response?.uploads);
        }
      };
      
      request.open('POST', `${window.location.origin}/api/_uploaders/${uploaderName}`);
      request.setRequestHeader('x-joystick-upload-id', uploadId);

      request.send(formData);
    });
  });
};