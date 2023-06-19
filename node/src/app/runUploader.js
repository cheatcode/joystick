/* eslint-disable consistent-return */

import fs from 'fs';
import AWS from 'aws-sdk';
import path from 'path';
import emitWebsocketEvent from '../websockets/emitWebsocketEvent';

const uploadToS3 = (upload = {}, options = {}, onUploadProgress) => {
  try {
    return new Promise((resolve) => {
      const temporaryFilePath = `.joystick/uploads/_tmp/${upload?.fileName}`;

      if (!fs.existsSync('.joystick/uploads/_tmp')) {
        fs.mkdirSync('.joystick/uploads/_tmp', { recursive: true });
      }
      
      const uploadParams = {
        Bucket: upload?.s3?.bucket,
        Key: upload?.fileName,
        Body: upload?.content,
      };

      if (upload?.fileName?.includes('.svg')) {
        // NOTE: Do this because AWS fails to properly detect mime type for SVGs.
        uploadParams.ContentType = 'image/svg+xml';
      }

      if (upload?.s3?.acl) {
        uploadParams.ACL = upload?.s3?.acl;
      }

      const s3 = new AWS.S3({
        accessKeyId: upload?.s3?.accessKeyId,
        secretAccessKey: upload?.s3?.secretAccessKey,
        region: upload?.s3?.region,
      });

      const s3Upload = s3.upload(uploadParams, {
        partSize: 5 * 1024 * 1024,
        queueSize: 3,
      });

      let previous = 0;

      s3Upload.on('httpUploadProgress', (s3UploadProgress) => {
        onUploadProgress('s3', s3UploadProgress?.loaded - previous);
        previous = s3UploadProgress?.loaded;
      });

      s3Upload.send((error, data) => {
        // NOTE: Don't break upload if there's an error, just log it out here and resolve
        // the request.
        if (error) {
          console.warn(error);
        }

        fs.unlink(temporaryFilePath, () => {
          const response = {
            id: options?.req?.headers['x-joystick-upload-id'],
            provider: 's3',
            url: data?.Location,
            size: upload?.fileSize,
            fileName: upload?.fileName,
            originalFileName: upload?.originalFileName,
            mimeType: upload?.mimeType,
          };

          if (error) {
            response.error = error?.message || 'There was an error uploading your file to Amazon S3. Check the server logs for more information.';
          }

          resolve(response);
        });
      });
    });
  } catch (exception) {
    throw new Error(`[runUploader.uploadToS3] ${exception.message}`);
  }
};

const uploadToLocal = (upload = {}, options = {}) => {
  try {
    return new Promise((resolve) => {
      if (upload?.local?.path) {          
        if (!fs.existsSync(upload?.local?.path)) {
          fs.mkdirSync(upload?.local?.path, { recursive: true });
        }

        const directoryPath = path.dirname(`${upload?.local?.path}/${upload?.fileName}`);
        
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }

        const filePath = `${upload?.local?.path}/${upload?.fileName}` || `./_uploads/${upload?.fileName}`;

        fs.writeFile(filePath, upload?.content, () => {
          resolve({
            id: options?.req?.headers['x-joystick-upload-id'],
            provider: 'local',
            url: filePath,
            size: upload?.fileSize,
            fileName: upload?.fileName,
            originalFileName: upload?.originalFileName,
            mimeType: upload?.mimeType,
          });
        });
      }
    });
  } catch (exception) {
    throw new Error(`[runUploader.uploadToLocal] ${exception.message}`);
  }
};

const handleUploads = async (options = {}) => {
  try {
    const uploads = [];
    let alreadyUploaded = options?.alreadyUploaded; // 100/200

    // NOTE: Use a closure here so we can pass it into the provider uploaders and avoid the
    // alreadyUploaded value being cached (leading to incorrect progress percentage).
    const onUploadProgress = (provider = '', chunk = 0) => {
      const progress = alreadyUploaded + chunk;
      const percentage = Math.round(((progress) / options?.totalFileSizeAllProviders) * 100);

      emitWebsocketEvent(
        `uploaders_${options?.req?.headers['x-joystick-upload-id']}`,
        'progress',
        { provider, progress: percentage }
      );

      alreadyUploaded += chunk;
    };

    for (let i = 0; i < options?.uploads?.length; i += 1) {
      const upload = options?.uploads[i];

      if (upload?.providers?.includes('local')) {
        // NOTE: Do not pass alreadyUploaded or onProgress to uploadToLocal as the existing total reflects
        // the transfer from the browser to the server (we assume that value is 1:1 with writing to disk
        // as the disk write is near-instant).
        const result = await uploadToLocal(upload, { ...options });
        uploads.push(result);
      }

      if (upload?.providers?.includes('s3')) {
        const result = await uploadToS3(upload, { ...options }, onUploadProgress);
        uploads.push(result);
      }
    }

    return uploads;
  } catch (exception) {
    throw new Error(`[runUploader.handleUploads] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.uploads) throw new Error('options.uploads is required.');
    if (!options.req) throw new Error('options.req is required.');
  } catch (exception) {
    throw new Error(`[runUploader.validateOptions] ${exception.message}`);
  }
};

const runUploader = async (options, promise = {}) => {
  try {
    validateOptions(options);
    const completedUploads = await handleUploads(options);
    promise.resolve(completedUploads);
  } catch (exception) {
    promise.reject(exception.message);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    runUploader(options, { resolve, reject });
  });
