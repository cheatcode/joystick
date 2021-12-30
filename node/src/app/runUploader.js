/* eslint-disable consistent-return */

import fs from 'fs';
import aws from 'aws-sdk';

const uploadToS3 = (upload = {}, options = {}) => {
  try {
    return new Promise((resolve) => {
      const temporaryFilePath = `.joystick/build/_tmp/${upload?.fileName}`;

      if (!fs.existsSync('.joystick/build/_tmp')) {
        fs.mkdirSync('.joystick/build/_tmp', { recursive: true });
      }

      aws.config.update({
        accessKeyId: upload?.s3?.accessKeyId,
        secretAccessKey: upload?.s3?.secretAccessKey,
        region: upload?.s3?.region,
      });
      
      const s3Upload = new aws.S3.ManagedUpload({
        partSize: 5 * 1024 * 1024,
        params: {
          Bucket: upload?.s3?.bucket,
          Key: upload?.fileName,
          Body: upload?.content,
        },
      });

      let uploaded = options?.progress;

      const emitter = joystick?.emitters[options?.req?.headers['x-joystick-upload-id']];
      let previous = 0;

      s3Upload.on('httpUploadProgress', (progress) => {
        if (emitter) {
          uploaded += progress?.loaded - previous;
          previous = progress?.loaded;

          const percentage = Math.round((uploaded / options?.totalFileSizeAllProviders) * 100);
          emitter.emit('progress', { provider: 's3', progress: percentage });
        }
      });

      s3Upload.send((_error, data) => {
        fs.unlink(temporaryFilePath, () => {
          resolve({
            id: options?.req?.headers['x-joystick-upload-id'],
            provider: 's3',
            url: data?.Location
          });
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

        const filePath = `${upload?.local?.path}/${upload?.fileName}` || `./_uploads/${upload?.fileName}`;

        fs.writeFile(filePath, upload?.content, () => {
          resolve({
            id: options?.req?.headers['x-joystick-upload-id'],
            provider: 'local',
            url: filePath
          });
        });
      }
    });
  } catch (exception) {
    throw new Error(`[runUploader.uploadToLocal] ${exception.message}`);
  }
};

const handleUploads = (options = {}) => {
  try {
    // uploads = [], req = {}
    // What is the file size * the number of providers?
    // Then, progress is handed off between providers (local -> s3 -> etc)

    return Promise.all(options?.uploads.flatMap((upload) => {
      const uploaders = [];

      if (upload?.providers.includes('local')) {
        uploaders.push(uploadToLocal(upload, options));
      }

      if (upload?.providers.includes('s3')) {
        uploaders.push(uploadToS3(upload, options));
      }

      return uploaders;
    }));
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
