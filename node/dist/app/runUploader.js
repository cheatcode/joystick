import fs from "fs";
import AWS from "aws-sdk";
import path from "path";
import emitWebsocketEvent from "../websockets/emitWebsocketEvent";
function writeFile(path2, contents, cb) {
  fs.mkdir(getDirName(path2), { recursive: true }, function(err) {
    if (err)
      return cb(err);
    fs.writeFile(path2, contents, cb);
  });
}
const uploadToS3 = (upload = {}, options = {}) => {
  try {
    return new Promise((resolve) => {
      const temporaryFilePath = `.joystick/uploads/_tmp/${upload?.fileName}`;
      if (!fs.existsSync(".joystick/uploads/_tmp")) {
        fs.mkdirSync(".joystick/uploads/_tmp", { recursive: true });
      }
      const uploadParams = {
        Bucket: upload?.s3?.bucket,
        Key: upload?.fileName,
        Body: upload?.content
      };
      if (upload?.fileName?.includes(".svg")) {
        uploadParams.ContentType = "image/svg+xml";
      }
      if (upload?.s3?.acl) {
        uploadParams.ACL = upload?.s3?.acl;
      }
      const s3 = new AWS.S3({
        accessKeyId: upload?.s3?.accessKeyId,
        secretAccessKey: upload?.s3?.secretAccessKey,
        region: upload?.s3?.region
      });
      const s3Upload = s3.upload(uploadParams, {
        partSize: 5 * 1024 * 1024,
        queueSize: 3
      });
      let uploaded = options?.progress;
      let previous = 0;
      s3Upload.on("httpUploadProgress", (progress) => {
        uploaded += progress?.loaded - previous;
        previous = progress?.loaded;
        const percentage = Math.round(uploaded / options?.totalFileSizeAllProviders * 100);
        emitWebsocketEvent(`uploaders_${options?.req?.headers["x-joystick-upload-id"]}`, "progress", { provider: "s3", progress: percentage });
      });
      s3Upload.send((error, data) => {
        if (error) {
          console.warn(error);
        }
        fs.unlink(temporaryFilePath, () => {
          const response = {
            id: options?.req?.headers["x-joystick-upload-id"],
            provider: "s3",
            url: data?.Location
          };
          if (error) {
            response.error = error?.message || "There was an error uploading your file to Amazon S3. Check the server logs for more information.";
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
            id: options?.req?.headers["x-joystick-upload-id"],
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
const handleUploads = (options = {}) => {
  try {
    return Promise.all(options?.uploads.flatMap((upload) => {
      const uploaders = [];
      if (upload?.providers.includes("local")) {
        uploaders.push(uploadToLocal(upload, options));
      }
      if (upload?.providers.includes("s3")) {
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
    const completedUploads = await handleUploads(options);
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
