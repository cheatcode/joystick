import fs from "fs";
import aws from "aws-sdk";
const uploadToS3 = (upload = {}, req = {}) => {
  try {
    return new Promise((resolve) => {
      const temporaryFilePath = `.joystick/build/_tmp/${upload?.fileName}`;
      if (!fs.existsSync(".joystick/build/_tmp")) {
        fs.mkdirSync(".joystick/build/_tmp", { recursive: true });
      }
      aws.config.update({
        accessKeyId: upload?.s3?.accessKeyId,
        secretAccessKey: upload?.s3?.secretAccessKey,
        region: upload?.s3?.region
      });
      const s3Upload = new aws.S3.ManagedUpload({
        partSize: 5 * 1024 * 1024,
        params: {
          Bucket: upload?.s3?.bucket,
          Key: upload?.fileName,
          Body: upload?.content
        }
      });
      s3Upload.send((_error, data) => {
        fs.unlink(temporaryFilePath, () => {
          resolve({
            id: "clientId",
            provider: "s3",
            url: data?.Location
          });
        });
      });
    });
  } catch (exception) {
    throw new Error(`[runUploader.uploadToS3] ${exception.message}`);
  }
};
const uploadToLocal = (upload = {}, req = {}) => {
  try {
    return new Promise((resolve) => {
      if (upload?.local?.path) {
        if (!fs.existsSync(upload?.local?.path)) {
          fs.mkdirSync(upload?.local?.path, { recursive: true });
        }
        const filePath = `${upload?.local?.path}/${upload?.fileName}` || `./_uploads/${upload?.fileName}`;
        fs.writeFile(filePath, upload?.content, () => {
          resolve({
            id: "clientId",
            provider: "local",
            url: filePath
          });
        });
      }
    });
  } catch (exception) {
    throw new Error(`[runUploader.uploadToLocal] ${exception.message}`);
  }
};
const handleUploads = (uploads = [], req = {}) => {
  try {
    return Promise.all(uploads.flatMap((upload) => {
      const uploaders = [];
      if (upload?.providers.includes("local")) {
        uploaders.push(uploadToLocal(upload, req));
      }
      if (upload?.providers.includes("s3")) {
        uploaders.push(uploadToS3(upload, req));
      }
      return uploaders;
    }));
  } catch (exception) {
    throw new Error(`[runUploader.handleUploads] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.uploads)
      throw new Error("options.uploads is required.");
    if (!options.req)
      throw new Error("options.req is required.");
  } catch (exception) {
    throw new Error(`[runUploader.validateOptions] ${exception.message}`);
  }
};
const runUploader = async (options, promise = {}) => {
  try {
    validateOptions(options);
    const completedUploads = await handleUploads(options?.uploads, options?.req);
    promise.resolve(completedUploads);
  } catch (exception) {
    promise.reject(exception.message);
  }
};
var runUploader_default = (options) => new Promise((resolve, reject) => {
  runUploader(options, { resolve, reject });
});
export {
  runUploader_default as default
};
