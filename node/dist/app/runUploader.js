import fs from "fs";
import aws from "aws-sdk";
import getAPIURLComponent from "./getAPIURLComponent";
import log from "../lib/log";
import formatAPIError from "../lib/formatAPIError";
import generateId from "../lib/generateId.js";
const uploadToS3 = (uploadOptions = {}, uploaderOptions = {}, req = {}) => {
  try {
    return new Promise((resolve) => {
      const temporaryFilePath = `.joystick/build/_tmp/${uploadOptions?.compiledFileName}`;
      if (!fs.existsSync(".joystick/build/_tmp")) {
        fs.mkdirSync(".joystick/build/_tmp", { recursive: true });
      }
      const file = fs.createWriteStream(temporaryFilePath);
      req.pipe(file);
      file.on("finish", () => {
        aws.config.update({
          accessKeyId: uploaderOptions?.s3?.accessKeyId,
          secretAccessKey: uploaderOptions?.s3?.secretAccessKey,
          region: uploaderOptions?.s3?.region
        });
        const s3Upload = new aws.S3.ManagedUpload({
          partSize: 5 * 1024 * 1024,
          params: {
            Bucket: uploaderOptions?.s3?.bucket,
            Key: uploadOptions?.compiledFileName,
            Body: fs.createReadStream(temporaryFilePath)
          }
        });
        s3Upload.send((_error, data) => {
          fs.unlink(temporaryFilePath, () => {
            resolve({
              provider: "s3",
              url: data?.Location
            });
          });
        });
        s3Upload.on("httpUploadProgress", (progress) => {
          console.log(progress);
        });
      });
    });
  } catch (exception) {
    throw new Error(`[runUploader.uploadToS3] ${exception.message}`);
  }
};
const uploadToLocal = (uploadOptions = {}, uploaderOptions = {}, req = {}) => {
  try {
    return new Promise((resolve) => {
      if (uploaderOptions?.providers?.includes("local") && uploaderOptions?.local?.path) {
        if (!fs.existsSync(uploaderOptions?.local?.path)) {
          fs.mkdirSync(uploaderOptions?.local?.path, { recursive: true });
        }
        const filePath = `${uploaderOptions?.local?.path}/${uploadOptions?.compiledFileName}` || `./_uploads/${uploadOptions?.compiledFileName}`;
        const file = fs.createWriteStream(filePath);
        req.pipe(file);
        file.on("finish", () => {
          resolve({
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
const handleUploads = (uploadOptions = {}, uploaderOptions = {}, req = {}) => {
  try {
    return Promise.all(uploaderOptions?.providers.map((provider) => {
      if (provider === "local") {
        return uploadToLocal(uploadOptions, uploaderOptions, req);
      }
      if (provider === "s3") {
        return uploadToS3(uploadOptions, uploaderOptions, req);
      }
    }));
  } catch (exception) {
    throw new Error(`[runUploader.handleUploads] ${exception.message}`);
  }
};
const handleBuildUploadOptions = (req = {}, formattedUploaderName = "", uploaderOptions = {}) => {
  try {
    const mimeType = req?.headers && req?.headers["content-type"];
    const fileExtension = mimeType?.split("/").pop();
    const fileSize = req?.headers && req?.headers["content-length"] ? parseFloat(req?.headers["content-length"], 10) : 0;
    const maxSizeInBytes = uploaderOptions?.maxSizeInMegabytes ? uploaderOptions?.maxSizeInMegabytes * 1024 * 1024 : null;
    const fileName = req?.headers && req?.headers["content-name"] || `${generateId(16)}.${fileExtension}`;
    const compiledFileName = uploaderOptions?.fileName && typeof uploaderOptions?.fileName === "function" ? uploaderOptions.fileName({ fileName, fileExtension, mimeType, fileSize }) : fileName;
    return {
      formattedUploaderName,
      mimeType,
      fileExtension,
      fileSize,
      maxSizeInBytes,
      fileName,
      compiledFileName
    };
  } catch (exception) {
    throw new Error(`[actionName.handleBuildUploadOptions] ${exception.message}`);
  }
};
const handleUploadErrors = ({ formattedUploaderName, uploadOptions, uploaderOptions, res }) => {
  try {
    const { maxSizeInBytes, fileSize, mimeType } = uploadOptions;
    if (maxSizeInBytes && !isNaN(maxSizeInBytes) && fileSize && fileSize > maxSizeInBytes) {
      const exception = {
        message: `Max file size for the uploader ${formattedUploaderName} is ${uploaderOptions?.maxSizeInMegabytes}MB.`
      };
      log(exception?.message, {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick#uploaders"
      });
      res.status(403).send(JSON.stringify({
        errors: [formatAPIError(exception, "server")]
      }));
      return true;
    }
    if (uploaderOptions?.mimeTypes?.length > 0 && !uploaderOptions.mimeTypes.includes(mimeType)) {
      const exception = {
        message: `The mime type ${mimeType} is not allowed by the uploader ${formattedUploaderName} (only ${uploaderOptions?.mimeTypes.join(", ")}).`
      };
      log(exception.message, {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick#uploaders"
      });
      res.status(403).send(JSON.stringify({
        errors: [formatAPIError(exception, "server")]
      }));
      return true;
    }
    return false;
  } catch (exception) {
    throw new Error(`[actionName.handleUploadErrors] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.uploaderName)
      throw new Error("options.uploaderName is required.");
    if (!options.uploaderOptions)
      throw new Error("options.uploaderOptions is required.");
    if (!options.req)
      throw new Error("options.req is required.");
    if (!options.res)
      throw new Error("options.res is required.");
  } catch (exception) {
    throw new Error(`[runUploader.validateOptions] ${exception.message}`);
  }
};
const runUploader = async (options, promise = {}) => {
  try {
    validateOptions(options);
    const formattedUploaderName = getAPIURLComponent(options?.uploaderName);
    const uploadOptions = handleBuildUploadOptions(options?.req, formattedUploaderName, options?.uploaderOptions);
    const hasErrors = handleUploadErrors({
      formattedUploaderName,
      uploadOptions,
      uploaderOptions: options?.uploaderOptions,
      res: options?.res
    });
    if (hasErrors) {
      return promise.resolve();
    }
    const uploads = await handleUploads(uploadOptions, options.uploaderOptions, options?.req);
    promise.resolve(uploads);
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
